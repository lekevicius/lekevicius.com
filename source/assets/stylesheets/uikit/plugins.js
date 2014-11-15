function replaceAll(find, replace, str)
{
  return str.replace(new RegExp(find, 'g'), replace);
}

function prepend_arguments(property, value, prefix)
{
  var prop = replaceAll('"', '', replaceAll("'", '', property.toString()));
  var vendor = replaceAll('"', '', replaceAll("'", '', prefix.toString()));
  return replaceAll(prop, vendor + prop, value.toString());
}

function image_path_from_url(url)
{
  url = url.toString();
  if (url.indexOf('url') > -1 && url.indexOf('://') < 0)
  {
    return url.toString().replace(/url\((['"])(.+?)\1\)/g, "$2");
  }
  else
  {
    return url;
  }
  // return url.toString().replace(new RegExp("url\([\'\"]", 'g'), "");
  // return replaceAll('url\(\"', '', replaceAll('\"\)', '', url.toString()));
}

var plugin = function()
{
  return function(style)
  {
    var nodes = this.nodes;
    style.define('prepend_arguments', function(property, value, prefix)
    {
      return new nodes.Ident(prepend_arguments(property, value, prefix));
    });
    style.define('image_path_from_url', function(url)
    {
      return new nodes.Ident(image_path_from_url(url));
    });
  };
};
exports = module.exports = plugin;
