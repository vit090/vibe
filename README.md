# Vibe

A top-down browser game built with TypeScript, Vite, and Three.js: a player that jogs/breathes procedurally, a squad of chasing enemy archetypes spawned in respawning clusters, a hitbox/hurtbox combat system, an economy with a coin HUD, and an upgrade station at a safe-zone map center.

## Running locally

```bash
npm install
npm run dev
```

Open the printed `Local` URL, or the `Network` URL from another device on the same Wi-Fi (e.g. a phone, to test the on-screen joystick). Add `?dev=1` to the URL to show a live-tuning dat.gui panel.

## Building

```bash
npm run build
```

Type-checks and produces a static build in `dist/`. Preview it locally with `npm run preview`.

## Deploying to GitHub Pages

This repo builds and deploys automatically via [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) whenever `main` is pushed. It uses GitHub's official Pages Actions (`upload-pages-artifact` + `deploy-pages`) — no `gh-pages` branch needs to be maintained by hand.

One manual, one-time step on GitHub: in the repo's **Settings → Pages**, set **Source** to **GitHub Actions**.

`vite.config.ts` sets `base: '/vibe/'` for production builds (matching this repo's Pages URL, `https://vit090.github.io/vibe/`) while leaving local dev at `/` so `npm run dev` keeps working unchanged. If the repo is ever renamed or moved, update that `base` value to match.

> **Note:** at the time this README was written, the working directory was on the `gh-pages` branch with all project files still uncommitted, and the deploy workflow triggers on pushes to `main`. Commit and push to `main` (not `gh-pages`) for the workflow to run.

## Prompt history

Every prompt asked in the chat session that built this project, in order:

1. creat a project that uses typescript, vite and threeJS
2. lets creat a large plane on the center of the world with wireframe texture, that will be the ground. creat a empyt object to be my player and set de camera to follow that object and creat a data for the camera (distance, yaw, pitch). expose this data in the config file
3. use dat.gui use that ui to camera settings in real time
4. creat a analog input for mobile/mouse that can track a direction and then apply the velocit to the player. creat a world sistem than you gona handle update my entitys. each of my base entity will have a update functionl with delta time and a fixed update with running a 30fps.
5. whats my ip?
6. im running the server but cant access from my phone, can you fix
7. add smooth follow at the camera
8. make the player jog and strech when move, and when is idle breath
9. the player anchor is centered, can you make it on the bottom of the player please
10. creat a collision system, its a top down 2d collision system, each entity have the own radious, hit box and hurt box. show the hit box as a circle under the entitys, creat enemys and when the player collider the enemys kill them
11. make an hp system, and attributes, give an attack range to the player, player reaches to attack enemy each shows in the screen a pop of the damage, flash the enemys when they got hit. when the entitys die flip then on the ground before they disapear. the enemys not attack yet, when they die player stop attack
    - (mid-task) make the dat.gui only appear with there is a url query with ?dev=1
12. when i change the speed the jog animation get all glitchy, can you make consistnent please
13. looks like the render is incorrect, i see jittery, is the render being the last thing happening? is it possible that multiple updates are change position and messing the render? can you make sure this doesnt happen?
14. when the attack the enemy push them back
15. creat a band service each bend the world is a statics service and i must be abble to applay every mesh easily
16. make the enemys wander and use the same player animation system
17. creat a economy system, add on the top hud, coin container, use a coin icon from figma and every time i kill a enemy pop the icon
18. when the enemy dies the coin pop from on the enemy die to the hud
19. whats the diference between the player hit box and hurt box, i need the hit box smaller for the enemy hit the player, i need when they see me they chase me and they hit my hurt box they damage me. add the player life bar on the top hud. if player dies restart the game
20. add the bar on the right to avoid overlap, when enemies hit player, add knock back, create enemy data to setup hp, power, knockback, color, etc. create 5 enemies types and create a cluster system to make they appear in clusters. handle the reaspaw per cluster overtime
21. creat a upgrade colider on center the map, when the player is on the upgrade collider, de coins fly the hud to upgrade collider then the player can pay for the upgrade. if player take the upgrade, the next one need wait onde minute
22. add the attributes under the life bar, if the upgrade cost 20 and player has 10, add that coins while im on the area or until i finish the amount for the upgrade. i dont want block enemies to come to safe area, i want them to stop targeting me if im inside a safe area
23. the enemies detect me from far and are to fast coming towards, make it more forgiving and meke the clusters to be spawned bit further from the center
24. no make a blue sky, fog to match the sky, and make the ground texture to look like grass, you can create a texture using a canvas and apply to the ground mesh
25. where i set the player hurtbox radius?
26. yes please
27. make a build, or a script to build, make sure it will work on git hub pages. then create a read.me with all prompts i asked this chat in order
