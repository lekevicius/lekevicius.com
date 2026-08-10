#!/usr/bin/env fish
# publish.fish — sequential multi-arch build & push to GHCR (robust)

function log  ; printf "\e[1;34m==>\e[0m %s\n" $argv 1>&2; end
function warn ; printf "\e[1;33m!! \e[0m%s\n"  $argv 1>&2; end
function die  ; printf "\e[1;31mxx \e[0m%s\n"  $argv 1>&2; exit 1; end
function req  ; command -v $argv[1] >/dev/null 2>&1; or die "Missing: $argv[1]"; end

# ── LOAD .env FILE ───────────────────────────────────────────────────────────
set -l envfile (dirname (status filename))/.env
if test -f $envfile
  log "Loading .env from $envfile"
  for line in (cat $envfile)
    # skip empty lines and comments
    string match -rq '^\s*#' -- $line; and continue
    string match -rq '^\s*$' -- $line; and continue
    # parse KEY=VALUE (supports quotes)
    set -l kv (string match -r '^([A-Za-z_][A-Za-z0-9_]*)=(.*)$' -- $line)
    if test (count $kv) -eq 3
      set -l key $kv[2]
      set -l val $kv[3]
      # strip surrounding quotes if present
      set val (string replace -r '^["\'](.*)["\']
$' '$1' -- $val)
      # only set if not already defined in environment
      if not set -q $key
        set -gx $key $val
      end
    end
  end
end

# ── CONFIG (env may override) ────────────────────────────────────────────────
set -q REGISTRY      ; or set -gx REGISTRY ghcr.io
# Support GHCR_OWNER/GHCR_IMAGE as aliases for OWNER/IMAGE
if not set -q OWNER; and set -q GHCR_OWNER
  set -gx OWNER $GHCR_OWNER
end
if not set -q IMAGE; and set -q GHCR_IMAGE
  set -gx IMAGE $GHCR_IMAGE
end
set -q OWNER         ; or set -gx OWNER ""
set -q IMAGE         ; or set -gx IMAGE ""
set -q PLATFORMS     ; or set -gx PLATFORMS "linux/amd64,linux/arm64"
set -q CONTEXT       ; or set -gx CONTEXT "."
set -q DOCKERFILE    ; or set -gx DOCKERFILE "Dockerfile"
set -q TAGS          ; or set -gx TAGS ""          # comma-separated, empty => auto
set -q LATEST_BRANCH ; or set -gx LATEST_BRANCH main
set -q CACHE_TAG_SUFFIX; or set -gx CACHE_TAG_SUFFIX buildcache
set -q PREBUILD_CMD  ; or set -gx PREBUILD_CMD     # unset if none
set -q BUILD_ARGS    ; or set -gx BUILD_ARGS       # fish list OR "K=V K2=V2"
set -q LABELS        ; or set -gx LABELS           # fish list OR "k=v,k2=v2"
set -q TARGET        ; or set -gx TARGET
set -q PUSH          ; or set -gx PUSH 1           # 1=push, 0=load
set -q PROVENANCE    ; or set -gx PROVENANCE false # true if you need SBOM/prov
set -q BUILDER_NAME  ; or set -gx BUILDER_NAME bx-(date +%s)-(random)
set -gx BUILDER_AUTOCLEAN 1
# ─────────────────────────────────────────────────────────────────────────────

req docker
docker info >/dev/null 2>&1; or die "Docker daemon not running."
docker buildx version >/dev/null 2>&1; or die "Docker Buildx is required."

# Infer OWNER/IMAGE safely
function _infer_from_git
  set -l url (git config --get remote.origin.url 2>/dev/null); or return 1
  set url (string replace -r '\.git$' '' -- $url)
  set url (string replace -r '^git@github\.com:' '' -- $url)
  set url (string replace -r '^https?://github\.com/' '' -- $url)
  set -l parts (string split '/' -- $url)
  echo $parts[1] $parts[-1]   # owner, repo basename
end

if test -n "$GITHUB_REPOSITORY"
  set -l parts (string split '/' -- $GITHUB_REPOSITORY)
  set -g OWNER $parts[1]
  set -g IMAGE $parts[2]
else if test -z "$OWNER" -o -z "$IMAGE"
  set -l p (_infer_from_git 2>/dev/null)
  if test -z "$OWNER" -a -n "$p[1]"; set -g OWNER $p[1]; end
  if test -z "$IMAGE" -a -n "$p[2]"; set -g IMAGE $p[2]; end
end
if test -z "$OWNER"; set -g OWNER $USER; end
if test -z "$IMAGE"; set -g IMAGE (basename (pwd)); end

# Allow OWNER to be "owner/image" and split it
if string match -rq '/' -- "$OWNER"
  if test -z "$IMAGE"
    set -l parts (string split '/' -- "$OWNER")
    if test (count $parts) -ne 2
      die "OWNER must be 'owner' or 'owner/repo'. Got: $OWNER"
    end
    set OWNER $parts[1]
    set IMAGE $parts[2]
  else
    die "OWNER contains '/' but IMAGE is also set. Use OWNER='owner' and IMAGE='repo' separately."
  end
end

# After this, sanitize (no slashes allowed anymore)
set OWNER (string lower -- $OWNER | string replace -ar '[^a-z0-9._-]' '-')
# IMAGE must be the repo name only (no '/')
set IMAGE (string lower -- (string split -m999 '/' -- $IMAGE)[-1] | string replace -ar '[^a-z0-9._-]' '-')

# validate context exists
test -n "$CONTEXT"; or set -g CONTEXT "."
test -e "$CONTEXT"; or die "Build context '$CONTEXT' does not exist."

set -g FULL_IMAGE_BASE "$REGISTRY/$OWNER/$IMAGE"
set -g CACHE_REF "$FULL_IMAGE_BASE:$CACHE_TAG_SUFFIX"

# Compose tags
set -l rawtags
if test -n "$TAGS"; set rawtags (string split ',' -- $TAGS); end
if test -n "$GITHUB_SHA"; set rawtags $rawtags (string sub -s 1 -l 7 -- $GITHUB_SHA); end
if test -n "$GITHUB_REF_NAME" -a -n "$GITHUB_REF_TYPE"
  set -l sanitized (string replace -a "/" "-" -- $GITHUB_REF_NAME)
  switch $GITHUB_REF_TYPE
    case branch
      set rawtags $rawtags $sanitized
      if test "$sanitized" = "$LATEST_BRANCH"; set rawtags $rawtags latest; end
    case tag
      set rawtags $rawtags $sanitized
      if string match -rq '^(v?\d+\.\d+\.\d+(-.+)?)$' -- $sanitized
        set rawtags $rawtags latest
      end
  end
end
if test -z "$GITHUB_REF_TYPE" -a -z "$TAGS"; set rawtags $rawtags latest; end
set -l UNIQUE_TAGS
for t in $rawtags
  test -z "$t"; and continue
  contains -- $t $UNIQUE_TAGS; or set UNIQUE_TAGS $UNIQUE_TAGS $t
end
test (count $UNIQUE_TAGS) -gt 0; or set UNIQUE_TAGS latest

# Auto GHCR login in Actions
if test -z "$GHCR_USERNAME" -a -n "$GITHUB_ACTOR" -a -n "$GITHUB_TOKEN"
  set -gx GHCR_USERNAME $GITHUB_ACTOR
  set -gx GHCR_TOKEN $GITHUB_TOKEN
end
if test -n "$GHCR_USERNAME" -a -n "$GHCR_TOKEN"
  log "Logging in to $REGISTRY as $GHCR_USERNAME…"
  echo -n $GHCR_TOKEN | docker login $REGISTRY -u $GHCR_USERNAME --password-stdin >/dev/null
end

log "Registry      : $REGISTRY"
log "Owner/Image   : $OWNER/$IMAGE"
log "Platforms     : $PLATFORMS"
log "Context       : $CONTEXT"
log "Dockerfile    : $DOCKERFILE"
log "Tags          : "(string join ' ' -- $UNIQUE_TAGS)
log "Cache ref     : $CACHE_REF"

# Ephemeral builder
log "Creating Buildx builder '$BUILDER_NAME'…"
docker buildx create --name $BUILDER_NAME --driver docker-container --use >/dev/null \
  ; or die "Failed to create buildx builder '$BUILDER_NAME'"
docker buildx inspect --bootstrap >/dev/null 2>&1

function _cleanup --on-event fish_exit
  if test "$BUILDER_AUTOCLEAN" = "1"
    docker buildx rm $BUILDER_NAME >/dev/null 2>&1
  end
end

# Optional prebuild
if test -n "$PREBUILD_CMD"
  log "Prebuild: $PREBUILD_CMD"
  fish -c "$PREBUILD_CMD"; or die "Prebuild failed."
end

# Emit build-args as newline-separated argv pairs:  --build-arg \n KEY=VAL
function _emit_build_args
  if test (count $BUILD_ARGS) -gt 1
    for kv in $BUILD_ARGS
      string match -q '*=*' -- $kv; and printf "%s\n%s\n" -- "--build-arg" "$kv"
    end
  else if test -n "$BUILD_ARGS"
    for kv in (string split ' ' -- $BUILD_ARGS)
      string match -q '*=*' -- $kv; and printf "%s\n%s\n" -- "--build-arg" "$kv"
    end
  end
end

# Emit labels likewise:  --label \n key=value
function _emit_labels
  if test (count $LABELS) -gt 1
    for lab in $LABELS
      test -n "$lab"; and printf "%s\n%s\n" -- "--label" "$lab"
    end
  else if test -n "$LABELS"
    for lab in (string split ' ' -- (string replace -a "," " " -- $LABELS))
      test -n "$lab"; and printf "%s\n%s\n" -- "--label" "$lab"
    end
  end
end

# Build one platform; stdout ONLY the digest ref (for manifest stitch)
function _build_one --argument-names platform tag
  set -l arch (string split / -- $platform)[2]
  set -l temp_tag "$FULL_IMAGE_BASE:$tag--$arch"

  # keep local cache small
  docker buildx prune -af --builder $BUILDER_NAME >/dev/null 2>&1

  set -l pushflag --push
  test "$PUSH" = "1"; or set pushflag --load
  set -l provflag --provenance=false
  test "$PROVENANCE" = "true"; and set provflag --provenance=true

  set -l base_args \
    --platform $platform \
    --file $DOCKERFILE \
    --cache-from type=registry,ref=$CACHE_REF \
    --cache-to   type=registry,ref=$CACHE_REF,mode=max

  set -l target_args
  test -n "$TARGET"; and set target_args --target $TARGET

  set -l buildarg_list (_emit_build_args)
  set -l label_list    (_emit_labels)

  # CONTEXT MUST BE LAST and non-empty
  log "Building $platform → $temp_tag …"
  docker buildx build \
    $base_args \
    $target_args \
    $buildarg_list \
    $label_list \
    -t $temp_tag \
    $pushflag \
    $provflag \
    "$CONTEXT" \
    ; or return 1

  set -l digest (docker buildx imagetools inspect $temp_tag | awk '/Digest:/ {print $2; exit}')
  test -n "$digest"; or return 2
  echo "$FULL_IMAGE_BASE@$digest"
end

# Build sequentially and stitch manifests
set -l plats (string split ',' -- $PLATFORMS)
for t in $UNIQUE_TAGS
  set -l refs
  for p in $plats
    set -l ref (_build_one $p $t); or die "Per-platform build failed ($p $t)"
    set refs $refs $ref
  end
  log "Creating multi-arch manifest for $t…"
  docker buildx imagetools create --tag "$FULL_IMAGE_BASE:$t" $refs \
    ; or die "Manifest create failed for $t"
end

# Verify
if test "$PUSH" = "1"
  log "Verifying manifests…"
  for t in $UNIQUE_TAGS
    docker buildx imagetools inspect "$FULL_IMAGE_BASE:$t" >/dev/null \
      ; or warn "Inspect failed for tag: $t"
  end
end

echo
log "DONE."
echo "Image     : $FULL_IMAGE_BASE"
echo "Tags      : "(string join ' ' -- $UNIQUE_TAGS)
echo "Platforms : $PLATFORMS"
echo "Cache     : $CACHE_REF"
