namespace SpriteKind {
    export const Shopkeeper = SpriteKind.create()
    export const Tool = SpriteKind.create()
}
/**
 * Start day: 6:00 AM (0)
 * 
 * Sunset start: 7:00 PM (1300)
 * 
 * Sunset end: 8:00 PM (1400)
 * 
 * End day: 10:00 PM (1600)
 */
/**
 * PLANT IDEAS:
 * 
 * 1. Self-spreading plant
 * 
 * 2. Tall plant (gets taller)
 * 
 * 3. Bubble plant (turns into diving helmet)
 * 
 * 4. Sprinkler plant (waters the soil around it)
 * 
 * 5. Jovial plant (says hello)
 * 
 * 6. Rude plant (insults you when it see you)
 * 
 * 7. Wanderer plant (walks around/follows random paths)
 * 
 * 8. Jumping plant (jumps)
 * 
 * 9. Companion plant (follows you around)
 * 
 * 10. Grabber plant (picks up things and sets them down)
 * 
 * 11. Scaredy plant (runs away from everything)
 * 
 * 12. Nomadic plant (picks up and replants other plants)
 * 
 * 13. Mole plant (turns grass around it into soil and tills it)
 * 
 * RECIPE IDEAS:
 * 
 * 1. Assistant: companion + grabber
 * 
 * 2. Auto tiller: mole + wanderer
 * 
 * 3. Friends: self-spreading + jovial
 * 
 * 4. Farmer: sprinkler + mole + wanderer + grabber
 */
function makeWateredTile (tile: Image) {
    waterTile = tile.clone()
    waterTile.replace(14, 12)
    return waterTile
}
function makeTool (image2: Image, name: string, amount: number, dontAddToInventory: boolean) {
    newTool = sprites.create(image2, SpriteKind.Tool)
    newTool.setFlag(SpriteFlag.Ghost, true)
    newTool.setFlag(SpriteFlag.Invisible, true)
    sprites.setDataString(newTool, "name", name)
    sprites.setDataNumber(newTool, "amount", amount)
    if (!(dontAddToInventory)) {
        tools.push(newTool)
    }
    return newTool
}
function ticksToTime (ticks: number) {
    return ticks * (REAL_WORLD_TIME_FOR_A_DAY / 1600)
}
controller.B.onEvent(ControllerButtonEvent.Pressed, function () {
    if (inventoryVisible) {
        BHandTool = tools[selectedIndex]
    } else if (BHandTool) {
        useTool(BHandTool, thePlayer)
    }
})
function updateTime () {
    if (timePassing) {
        if (lastTime) {
            currentTime += (game.runtime() - lastTime) * (1600 / REAL_WORLD_TIME_FOR_A_DAY)
            if (dayState == "day" && currentTime > 1300) {
                dayState = "sunsetting"
                color.startFade(color.originalPalette, color.GrayScale, ticksToTime(1400 - currentTime))
            } else if (dayState == "sunset" && currentTime > 1400) {
                dayState = "evening"
            } else if (currentTime > 1600) {
                startNextDay()
            }
        }
        lastTime = game.runtime()
    }
}
function startNextDay () {
    tiles.loadMap(farmMap)
    tiles.placeOnRandomTile(thePlayer, assets.tile`myTile2`)
    currentTime = 0
    dayState = "day"
    for (let value of tiles.getTilesByType(assets.tile`myTile0`)) {
        if (Math.percentChance(5)) {
            tiles.setTileAt(value, assets.tile`myTile27`)
        }
    }
    for (let value of tiles.getTilesByType(assets.tile`myTile0`)) {
        if (Math.percentChance(1)) {
            tiles.setTileAt(value, assets.tile`myTile31`)
            tiles.setWallAt(value, true)
            info.changeScoreBy(1)
        }
        if (Math.percentChance(8)) {
            tiles.setTileAt(value, assets.tile`myTile17`)
            tiles.setWallAt(value, true)
            info.changeScoreBy(1)
        }
    }
    color.startFade(color.GrayScale, color.originalPalette, 500)
}
function closeInventory () {
    inventoryVisible = false
    controller.moveSprite(thePlayer)
}
controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    if (inventoryVisible) {
        AHandTool = tools[selectedIndex]
    } else if (AHandTool) {
        useTool(AHandTool, thePlayer)
    }
})
function getRandomSeed () {
    seedseed = randint(0, 0)
    if (seedseed == 0) {
        newSeed = makeTool(assets.image`spreading plant seeds`, "ore", 1, true)
    }
    sprites.setDataBoolean(newSeed, "isSeed", true)
    return newSeed
}
tiles.onMapLoaded(function (tilemap2) {
    tiles.coverAllTiles(assets.tile`myTile2`, assets.tile`myTile27`)
    tiles.coverAllTiles(tiles.util.door4, assets.tile`myTile29`)
})
controller.left.onEvent(ControllerButtonEvent.Pressed, function () {
    selectedIndex = Math.max(selectedIndex - 1, 0)
})
spriteutils.createRenderable(99, function (screen2) {
    screen2.fillRect(2, 98, 26, 20, 13)
    screen2.drawRect(2, 98, 26, 20, 14)
    screen2.fillRect(21, 98, 7, 20, 14)
    images.print(screen2, "A", 22, 104, 13)
    if (AHandTool) {
        spriteutils.drawTransparentImage(AHandTool.image, screen2, 4, 100)
    }
    screen2.fillRect(32, 98, 26, 20, 13)
    screen2.drawRect(32, 98, 26, 20, 14)
    screen2.fillRect(51, 98, 7, 20, 14)
    images.print(screen2, "B", 52, 104, 13)
    if (BHandTool) {
        spriteutils.drawTransparentImage(BHandTool.image, screen2, 34, 100)
    }
})
controller.right.onEvent(ControllerButtonEvent.Pressed, function () {
    selectedIndex = Math.min(selectedIndex + 1, tools.length - 1)
})
function useTool (toolToUse: Sprite, toolUser: Sprite) {
    currentTile = tiles.locationOfSprite(toolUser)
    tileList = [
    tiles.locationInDirection(currentTile, CollisionDirection.Top),
    tiles.locationInDirection(currentTile, CollisionDirection.Right),
    tiles.locationInDirection(currentTile, CollisionDirection.Bottom),
    tiles.locationInDirection(currentTile, CollisionDirection.Left)
    ]
    if (sprites.readDataString(toolToUse, "name") == "shovel") {
        if (tiles.tileIs(currentTile, assets.tile`myTile27`)) {
            tiles.setTileAt(currentTile, assets.tile`myTile0`)
        }
    }
    if (sprites.readDataString(toolToUse, "name") == "pickaxe") {
        for (let value of tileList) {
            if (tiles.tileIs(value, assets.tile`myTile31`)) {
                tiles.setTileAt(value, assets.tile`myTile0`)
                tiles.setWallAt(value, false)
                getRandomSeed()
            }
        }
    }
    if (sprites.readDataString(toolToUse, "name") == "pickaxe") {
        for (let value of tileList) {
            if (tiles.tileIs(value, assets.tile`myTile17`)) {
                tiles.setTileAt(value, assets.tile`myTile0`)
                tiles.setWallAt(value, false)
                getRandomSeed()
            }
        }
    }
}
controller.menu.onEvent(ControllerButtonEvent.Pressed, function () {
    if (inventoryVisible) {
        closeInventory()
        lastTime = 0
        timePassing = true
    } else {
        openInventory()
        timePassing = false
    }
})
function openInventory () {
    inventoryVisible = true
    controller.moveSprite(thePlayer, 0, 0)
    selectedIndex = 0
}
spriteutils.createRenderable(100, function (screen2) {
    if (inventoryVisible) {
        screen2.fillRect(10, 10, 140, 100, 13)
        screen2.drawRect(10, 10, 140, 100, 14)
        images.print(screen2, "Inventory", 14, 14, 15)
        images.print(screen2, sprites.readDataString(tools[selectedIndex], "name"), 72, 14, 11)
        screen2.fillRect(14, 24, 132, 1, 15)
        tool_top = 28
        for (let index = 0; index <= tools.length - 1; index++) {
            toolColumn = index % 6
            toolRow = Math.idiv(index, 6)
            spriteutils.drawTransparentImage(tools[index].image, screen2, 14 + toolColumn * 20, tool_top + toolRow * 20)
        }
        toolColumn = selectedIndex % 6
        toolRow = Math.idiv(selectedIndex, 6)
        spriteutils.drawTransparentImage(assets.image`selector`, screen2, 14 + toolColumn * 20 - 2, tool_top + toolRow * 20 - 2)
    }
})
let toolRow = 0
let toolColumn = 0
let tool_top = 0
let tileList: tiles.Location[] = []
let currentTile: tiles.Location = null
let newSeed: Sprite = null
let seedseed = 0
let selectedIndex = 0
let inventoryVisible = false
let newTool: Sprite = null
let waterTile: Image = null
let timePassing = false
let dayState = ""
let lastTime = 0
let REAL_WORLD_TIME_FOR_A_DAY = 0
let currentTime = 0
let BHandTool: Sprite = null
let AHandTool: Sprite = null
let tools: Sprite[] = []
let thePlayer: Sprite = null
let farmMap: tiles.WorldMap = null
farmMap = tiles.createMap(tilemap`level2`)
let shopMap = tiles.createMap(tilemap`level4`)
tiles.connectMapById(farmMap, shopMap, ConnectionKind.Door1)
tiles.loadMap(farmMap)
thePlayer = sprites.create(img`
    . . . . . . . . . . . . . . . . 
    . 5 . . 5 5 5 . . . . . . . . . 
    . . 5 2 5 5 5 5 . . . . . . . . 
    . . f 5 2 2 2 2 . . . . . . . . 
    . f f f 5 5 5 5 5 5 . . . . . . 
    f f f f f f f f . . . . . . . . 
    . . f f f f f f . . . . . . . . 
    . . . f f f c f f f f f f f f f 
    . . . f f c f f f f f f c f f . 
    . . . f f c f f f f f c f f . . 
    . . . . f f c c c c c f f . . . 
    . . . . f f f f f f f f . . . . 
    . . . . . . f f f f . . . . . . 
    . . . . . . . 4 . 4 . . . . . . 
    . . . . . . . 4 . . . . . . . . 
    . . . . . . . . . . . . . . . . 
    `, SpriteKind.Player)
character.loopFrames(
thePlayer,
[img`
    . . . . f f f f f f . . . . . . 
    . . . f 2 f e e e e f f . . . . 
    . . f 2 2 2 f e e e e f f . . . 
    . . f e e e e f f e e e f . . . 
    . f e 2 2 2 2 e e f f f f . . . 
    . f 2 e f f f f 2 2 2 e f . . . 
    . f f f e e e f f f f f f f . . 
    . f e e 4 4 f b e 4 4 e f f . . 
    . . f e d d f 1 4 d 4 e e f . . 
    . . . f d d d d 4 e e e f . . . 
    . . . f e 4 4 4 e e f f . . . . 
    . . . f 2 2 2 e d d 4 . . . . . 
    . . . f 2 2 2 e d d e . . . . . 
    . . . f 5 5 4 f e e f . . . . . 
    . . . . f f f f f f . . . . . . 
    . . . . . . f f f . . . . . . . 
    `,img`
    . . . . . . . . . . . . . . . . 
    . . . . f f f f f f . . . . . . 
    . . . f 2 f e e e e f f . . . . 
    . . f 2 2 2 f e e e e f f . . . 
    . . f e e e e f f e e e f . . . 
    . f e 2 2 2 2 e e f f f f . . . 
    . f 2 e f f f f 2 2 2 e f . . . 
    . f f f e e e f f f f f f f . . 
    . f e e 4 4 f b e 4 4 e f f . . 
    . . f e d d f 1 4 d 4 e e f . . 
    . . . f d d d e e e e e f . . . 
    . . . f e 4 e d d 4 f . . . . . 
    . . . f 2 2 e d d e f . . . . . 
    . . f f 5 5 f e e f f f . . . . 
    . . f f f f f f f f f f . . . . 
    . . . f f f . . . f f . . . . . 
    `,img`
    . . . . f f f f f f . . . . . . 
    . . . f 2 f e e e e f f . . . . 
    . . f 2 2 2 f e e e e f f . . . 
    . . f e e e e f f e e e f . . . 
    . f e 2 2 2 2 e e f f f f . . . 
    . f 2 e f f f f 2 2 2 e f . . . 
    . f f f e e e f f f f f f f . . 
    . f e e 4 4 f b e 4 4 e f f . . 
    . . f e d d f 1 4 d 4 e e f . . 
    . . . f d d d d 4 e e e f . . . 
    . . . f e 4 4 4 e e f f . . . . 
    . . . f 2 2 2 e d d 4 . . . . . 
    . . . f 2 2 2 e d d e . . . . . 
    . . . f 5 5 4 f e e f . . . . . 
    . . . . f f f f f f . . . . . . 
    . . . . . . f f f . . . . . . . 
    `,img`
    . . . . . . . . . . . . . . . . 
    . . . . f f f f f f . . . . . . 
    . . . f 2 f e e e e f f . . . . 
    . . f 2 2 2 f e e e e f f . . . 
    . . f e e e e f f e e e f . . . 
    . f e 2 2 2 2 e e f f f f . . . 
    . f 2 e f f f f 2 2 2 e f . . . 
    . f f f e e e f f f f f f f . . 
    . f e e 4 4 f b e 4 4 e f f . . 
    . . f e d d f 1 4 d 4 e e f . . 
    . . . f d d d d 4 e e e f . . . 
    . . . f e 4 4 4 e d d 4 . . . . 
    . . . f 2 2 2 2 e d d e . . . . 
    . . f f 5 5 4 4 f e e f . . . . 
    . . f f f f f f f f f f . . . . 
    . . . f f f . . . f f . . . . . 
    `],
200,
character.rule(Predicate.MovingLeft)
)
character.loopFrames(
thePlayer,
[img`
    . . . . . . f f f f f f . . . . 
    . . . . f f e e e e f 2 f . . . 
    . . . f f e e e e f 2 2 2 f . . 
    . . . f e e e f f e e e e f . . 
    . . . f f f f e e 2 2 2 2 e f . 
    . . . f e 2 2 2 f f f f e 2 f . 
    . . f f f f f f f e e e f f f . 
    . . f f e 4 4 e b f 4 4 e e f . 
    . . f e e 4 d 4 1 f d d e f . . 
    . . . f e e e 4 d d d d f . . . 
    . . . . f f e e 4 4 4 e f . . . 
    . . . . . 4 d d e 2 2 2 f . . . 
    . . . . . e d d e 2 2 2 f . . . 
    . . . . . f e e f 4 5 5 f . . . 
    . . . . . . f f f f f f . . . . 
    . . . . . . . f f f . . . . . . 
    `,img`
    . . . . . . . . . . . . . . . . 
    . . . . . . f f f f f f . . . . 
    . . . . f f e e e e f 2 f . . . 
    . . . f f e e e e f 2 2 2 f . . 
    . . . f e e e f f e e e e f . . 
    . . . f f f f e e 2 2 2 2 e f . 
    . . . f e 2 2 2 f f f f e 2 f . 
    . . f f f f f f f e e e f f f . 
    . . f f e 4 4 e b f 4 4 e e f . 
    . . f e e 4 d 4 1 f d d e f . . 
    . . . f e e e e e d d d f . . . 
    . . . . . f 4 d d e 4 e f . . . 
    . . . . . f e d d e 2 2 f . . . 
    . . . . f f f e e f 5 5 f f . . 
    . . . . f f f f f f f f f f . . 
    . . . . . f f . . . f f f . . . 
    `,img`
    . . . . . . f f f f f f . . . . 
    . . . . f f e e e e f 2 f . . . 
    . . . f f e e e e f 2 2 2 f . . 
    . . . f e e e f f e e e e f . . 
    . . . f f f f e e 2 2 2 2 e f . 
    . . . f e 2 2 2 f f f f e 2 f . 
    . . f f f f f f f e e e f f f . 
    . . f f e 4 4 e b f 4 4 e e f . 
    . . f e e 4 d 4 1 f d d e f . . 
    . . . f e e e 4 d d d d f . . . 
    . . . . f f e e 4 4 4 e f . . . 
    . . . . . 4 d d e 2 2 2 f . . . 
    . . . . . e d d e 2 2 2 f . . . 
    . . . . . f e e f 4 5 5 f . . . 
    . . . . . . f f f f f f . . . . 
    . . . . . . . f f f . . . . . . 
    `,img`
    . . . . . . . . . . . . . . . . 
    . . . . . . f f f f f f . . . . 
    . . . . f f e e e e f 2 f . . . 
    . . . f f e e e e f 2 2 2 f . . 
    . . . f e e e f f e e e e f . . 
    . . . f f f f e e 2 2 2 2 e f . 
    . . . f e 2 2 2 f f f f e 2 f . 
    . . f f f f f f f e e e f f f . 
    . . f f e 4 4 e b f 4 4 e e f . 
    . . f e e 4 d 4 1 f d d e f . . 
    . . . f e e e 4 d d d d f . . . 
    . . . . 4 d d e 4 4 4 e f . . . 
    . . . . e d d e 2 2 2 2 f . . . 
    . . . . f e e f 4 4 5 5 f f . . 
    . . . . f f f f f f f f f f . . 
    . . . . . f f . . . f f f . . . 
    `],
200,
character.rule(Predicate.MovingRight)
)
character.loopFrames(
thePlayer,
[img`
    . . . . . . f f f f . . . . . . 
    . . . . f f f 2 2 f f f . . . . 
    . . . f f f 2 2 2 2 f f f . . . 
    . . f f f e e e e e e f f f . . 
    . . f f e 2 2 2 2 2 2 e e f . . 
    . . f e 2 f f f f f f 2 e f . . 
    . . f f f f e e e e f f f f . . 
    . f f e f b f 4 4 f b f e f f . 
    . f e e 4 1 f d d f 1 4 e e f . 
    . . f e e d d d d d d e e f . . 
    . . . f e e 4 4 4 4 e e f . . . 
    . . e 4 f 2 2 2 2 2 2 f 4 e . . 
    . . 4 d f 2 2 2 2 2 2 f d 4 . . 
    . . 4 4 f 4 4 5 5 4 4 f 4 4 . . 
    . . . . . f f f f f f . . . . . 
    . . . . . f f . . f f . . . . . 
    `,img`
    . . . . . . . . . . . . . . . . 
    . . . . . . f f f f . . . . . . 
    . . . . f f f 2 2 f f f . . . . 
    . . . f f f 2 2 2 2 f f f . . . 
    . . f f f e e e e e e f f f . . 
    . . f f e 2 2 2 2 2 2 e e f . . 
    . f f e 2 f f f f f f 2 e f f . 
    . f f f f f e e e e f f f f f . 
    . . f e f b f 4 4 f b f e f . . 
    . . f e 4 1 f d d f 1 4 e f . . 
    . . . f e 4 d d d d 4 e f e . . 
    . . f e f 2 2 2 2 e d d 4 e . . 
    . . e 4 f 2 2 2 2 e d d e . . . 
    . . . . f 4 4 5 5 f e e . . . . 
    . . . . f f f f f f f . . . . . 
    . . . . f f f . . . . . . . . . 
    `,img`
    . . . . . . f f f f . . . . . . 
    . . . . f f f 2 2 f f f . . . . 
    . . . f f f 2 2 2 2 f f f . . . 
    . . f f f e e e e e e f f f . . 
    . . f f e 2 2 2 2 2 2 e e f . . 
    . . f e 2 f f f f f f 2 e f . . 
    . . f f f f e e e e f f f f . . 
    . f f e f b f 4 4 f b f e f f . 
    . f e e 4 1 f d d f 1 4 e e f . 
    . . f e e d d d d d d e e f . . 
    . . . f e e 4 4 4 4 e e f . . . 
    . . e 4 f 2 2 2 2 2 2 f 4 e . . 
    . . 4 d f 2 2 2 2 2 2 f d 4 . . 
    . . 4 4 f 4 4 5 5 4 4 f 4 4 . . 
    . . . . . f f f f f f . . . . . 
    . . . . . f f . . f f . . . . . 
    `,img`
    . . . . . . . . . . . . . . . . 
    . . . . . . f f f f . . . . . . 
    . . . . f f f 2 2 f f f . . . . 
    . . . f f f 2 2 2 2 f f f . . . 
    . . f f f e e e e e e f f f . . 
    . . f e e 2 2 2 2 2 2 e f f . . 
    . f f e 2 f f f f f f 2 e f f . 
    . f f f f f e e e e f f f f f . 
    . . f e f b f 4 4 f b f e f . . 
    . . f e 4 1 f d d f 1 4 e f . . 
    . . e f e 4 d d d d 4 e f . . . 
    . . e 4 d d e 2 2 2 2 f e f . . 
    . . . e d d e 2 2 2 2 f 4 e . . 
    . . . . e e f 5 5 4 4 f . . . . 
    . . . . . f f f f f f f . . . . 
    . . . . . . . . . f f f . . . . 
    `],
500,
character.rule(Predicate.MovingDown)
)
character.loopFrames(
thePlayer,
[img`
    . . . . . . f f f f . . . . . . 
    . . . . f f e e e e f f . . . . 
    . . . f e e e f f e e e f . . . 
    . . f f f f f 2 2 f f f f f . . 
    . . f f e 2 e 2 2 e 2 e f f . . 
    . . f e 2 f 2 f f 2 f 2 e f . . 
    . . f f f 2 2 e e 2 2 f f f . . 
    . f f e f 2 f e e f 2 f e f f . 
    . f e e f f e e e e f e e e f . 
    . . f e e e e e e e e e e f . . 
    . . . f e e e e e e e e f . . . 
    . . e 4 f f f f f f f f 4 e . . 
    . . 4 d f 2 2 2 2 2 2 f d 4 . . 
    . . 4 4 f 4 4 4 4 4 4 f 4 4 . . 
    . . . . . f f f f f f . . . . . 
    . . . . . f f . . f f . . . . . 
    `,img`
    . . . . . . . . . . . . . . . . 
    . . . . . . f f f f . . . . . . 
    . . . . f f e e e e f f . . . . 
    . . . f e e e f f e e e f . . . 
    . . . f f f f 2 2 f f f f . . . 
    . . f f e 2 e 2 2 e 2 e f f . . 
    . . f e 2 f 2 f f f 2 f e f . . 
    . . f f f 2 f e e 2 2 f f f . . 
    . . f e 2 f f e e 2 f e e f . . 
    . f f e f f e e e f e e e f f . 
    . f f e e e e e e e e e e f f . 
    . . . f e e e e e e e e f . . . 
    . . . e f f f f f f f f 4 e . . 
    . . . 4 f 2 2 2 2 2 e d d 4 . . 
    . . . e f f f f f f e e 4 . . . 
    . . . . f f f . . . . . . . . . 
    `,img`
    . . . . . . f f f f . . . . . . 
    . . . . f f e e e e f f . . . . 
    . . . f e e e f f e e e f . . . 
    . . f f f f f 2 2 f f f f f . . 
    . . f f e 2 e 2 2 e 2 e f f . . 
    . . f e 2 f 2 f f 2 f 2 e f . . 
    . . f f f 2 2 e e 2 2 f f f . . 
    . f f e f 2 f e e f 2 f e f f . 
    . f e e f f e e e e f e e e f . 
    . . f e e e e e e e e e e f . . 
    . . . f e e e e e e e e f . . . 
    . . e 4 f f f f f f f f 4 e . . 
    . . 4 d f 2 2 2 2 2 2 f d 4 . . 
    . . 4 4 f 4 4 4 4 4 4 f 4 4 . . 
    . . . . . f f f f f f . . . . . 
    . . . . . f f . . f f . . . . . 
    `,img`
    . . . . . . . . . . . . . . . . 
    . . . . . . f f f f . . . . . . 
    . . . . f f e e e e f f . . . . 
    . . . f e e e f f e e e f . . . 
    . . . f f f f 2 2 f f f f . . . 
    . . f f e 2 e 2 2 e 2 e f f . . 
    . . f e f 2 f f f 2 f 2 e f . . 
    . . f f f 2 2 e e f 2 f f f . . 
    . . f e e f 2 e e f f 2 e f . . 
    . f f e e e f e e e f f e f f . 
    . f f e e e e e e e e e e f f . 
    . . . f e e e e e e e e f . . . 
    . . e 4 f f f f f f f f e . . . 
    . . 4 d d e 2 2 2 2 2 f 4 . . . 
    . . . 4 e e f f f f f f e . . . 
    . . . . . . . . . f f f . . . . 
    `],
500,
character.rule(Predicate.MovingUp)
)
controller.moveSprite(thePlayer)
scene.cameraFollowSprite(thePlayer)
tiles.placeOnRandomTile(thePlayer, assets.tile`myTile2`)
tools = []
makeTool(assets.image`shovel`, "shovel", 1, false)
makeTool(assets.image`pickaxe`, "pickaxe", 1, false)
tools.push(getRandomSeed())
AHandTool = tools[2]
BHandTool = tools[6]
info.setScore(0)
currentTime = 0
REAL_WORLD_TIME_FOR_A_DAY = 30000
lastTime = 0
dayState = "day"
timePassing = true
game.onUpdate(function () {
    updateTime()
})
