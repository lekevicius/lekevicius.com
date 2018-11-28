---
title: Pokémon Go Maps
description: Heatmaps where in the city Pokémon appeared
pageDescription: When Pokémon Go was the biggest trend of the week, I created a tool to show heatmaps where each Pokémon appears most often.
group: hacks
order: 3
bodyclass: dark
---

<div class="picture">
  <img class="captioned" src="./pokemon-go/graphic.png" alt="Pokemon Go map showing sightings of Poliwag in Londond">
  <p class="caption secondary">Heatmap showing Pokémon Go sightings of Poliwag in London</p>
</div>

The week when Pokémon Go became available worldwide was very crazy. It exploded as the most hyped game of the summer, and it seemed that everyone was playing it.

Quite quickly, people developed tools to query the API for locations, allowing to find if certain pokémon were at any given spot. This hunting with [live maps](https://jz.js.org/PoGoMap/) was incredibly powerful way to find rare pokémons.

I came up with an idea to use this API to create heatmaps instead of live maps. For 4 cities — New York, London, Tokyo and my own city Vilnius — I queried the API non-stop for as big a radius as I could, registering millions of pokémon "appearances": moments when a certain pokémon spawned at a coordinate.

I then used this data to build heatmaps: over a hundred images, for for each pokémon, for each city. You could see, for instance, that:

###### Pinser appeared almost exclusively in Central Park in New York:

![Pinser in New York](./pokemon-go/NYC-127-Pinsir.png)

###### Paras really liked the western part of Hyde park, London:

![Paras in London](./pokemon-go/LDN-46-Paras.png)

###### In Tokyo, Pikachu was spawning in Shinjuku Gyoen National Garden:

![Pikachu in Tokyo](./pokemon-go/TYO-25-Pikachu.png)

###### Finally, in Vilnius, Lickitung could only be found on the Gediminas castle hill.

![Lickitung in Vilnius](./pokemon-go/VNO-108-Lickitung.png)

These maps, that I later shared on reddits and Facebook groups, were a major hit. However soon after I compiled this data, Niantic, developers of Pokémon Go, locked down the API so it was impossible to run the script anymore.

---

Below are some of the more interesting pokémon heatmaps.

<div class="picture">
  <img class="captioned" src="./pokemon-go/NYC-4-Charmander.png" alt="Charmander in New York">
  <p class="caption secondary">Charmander in New York could most often be found around the American Museum of Natural History</p>
</div>

<div class="picture">
  <img class="captioned" src="./pokemon-go/TYO-16-Pidgey.png" alt="Pidgey in Tokyo">
  <p class="caption secondary">Pidgey is a pokémon that appeared <em>everywhere</em> — except in Tokyo no pokémon <em>ever</em> appeared on the island of Imperial Palace.</p>
</div>

<div class="picture">
  <img class="captioned" src="./pokemon-go/LDN-19-Rattata.png" alt="Ratata in London">
  <p class="caption secondary">Ratata in London: mostly everywhere, but avoids parks.</p>
</div>

<div class="picture">
  <img class="captioned" src="./pokemon-go/VNO-43-Oddish.png" alt="Oddish in Vilnius">
  <p class="caption secondary">Oddish in Vilnius had its favorite little park.</p>
</div>

<div class="picture">
  <img class="captioned" src="./pokemon-go/NYC-52-Meowth.png" alt="Meowth in New York">
  <p class="caption secondary">In New York, Meowth had a very beautiful distribution.</p>
</div>

<div class="picture">
  <img class="captioned" src="./pokemon-go/LDN-54-Psyduck.png" alt="Psyduck in London">
  <p class="caption secondary">In most cities Psyduck could be found around water. In London it was also all over Battersea Park.</p>
</div>

<div class="picture">
  <img class="captioned" src="./pokemon-go/LDN-79-Slowpoke.png" alt="Slowpoke in London">
  <p class="caption secondary">Slowpoke is another pokémon that's more common around water, but usually also picks a “favorite park”, if it makes any sense.</p>
</div>

<div class="picture">
  <img class="captioned" src="./pokemon-go/NYC-81-Magnemite.png" alt="Magnemite in New York">
  <p class="caption secondary">Magnemite in New York: I'm sure there's some kind of logic, but I can't decipher it.</p>
</div>


<div class="picture">
  <img class="captioned" src="./pokemon-go/NYC-129-Magikarp.png" alt="Magikarp in New York">
  <p class="caption secondary">Magikarp makes all the coasts glow in all the cities.</p>
</div>

<div class="picture">
  <img class="captioned" src="./pokemon-go/TYO-126-Magmar.png" alt="Magmar in Tokyo">
  <p class="caption secondary">Like Pikachu, Magmar also picked a “favorite park” in Tokyo.</p>
</div>

#### Tech Stack

<ul class="tag-list">
<li>pgoapi</li> <li>PokemonGo-Map</li> <li>heatmap.py</li> <li>Stamen Toner map</li>
</ul>
