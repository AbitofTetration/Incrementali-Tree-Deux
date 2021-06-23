let modInfo = {
	name: "The Incrementali Tree",
	id: "mymod",
	author: "nobody",
	pointsName: "points",
	modFiles: ["layers.js", "layers/row1.js", "layers/row2.js", "layers/row3.js", "tree.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (10), // Used for hard resets and new players
	offlineLimit: 1,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.2",
	name: "The Ascension Upgrade",
}

let changelog = ``

let winText = `Congratulations! You have reached the end and beaten this game, but for now...`

// If you add new functions anywhere inside of a layer, and those functions have an effect when called, add them here.
// (The ones here are examples, all official functions are already taken care of)
var doNotCallTheseFunctionsEveryTick = ["blowUpEverything"]

function getStartPoints(){
    return new Decimal(modInfo.initialStartPoints)
}

// Determines if it should show points/sec
function canGenPoints(){
	return true
}

function getIncrementaliEff() {
  let eff = new Decimal(2)
  if (hasUpgrade("p", 11)) eff = eff.mul(1.1)
  if (hasUpgrade("p", 12)) eff = eff.mul(1.1)
  if (hasUpgrade("p", 23)) eff = eff.mul(1.15)
  if (hasUpgrade("s", 11)) eff = eff.mul(1.02)
  if (hasUpgrade("t", 12)) eff = eff.mul(1.1)
  if (player.q.unlocked) eff = eff.mul(buyableEffect("q", 11))
  if (player.i.unlocked) eff = eff.mul(layers.i.effect().incrementBuff)
  if (player.i.unlocked) eff = eff.mul(buyableEffect("i", 11))
  if (!inChallenge("e", 12) && player.sh.unlocked) eff = eff.mul(buyableEffect("sh", 32))
  if (inChallenge("e", 11)) eff = eff.div(25)
  return eff
}

function getIncrementaliSelfBoost() {
  let boost = player.points.add(3).log10().add(1).pow(getIncrementaliEff()).sub(1)
  if (boost.gt(1e6)) boost = boost.sqrt().mul(1e3)
  return boost
}

// Calculate points/sec!
function getPointGen() {
	if(!canGenPoints())
		return new Decimal(0)

	let gain = new Decimal(0.01)
  gain = gain.mul(getIncrementaliSelfBoost())
  if (hasUpgrade("p", 13)) gain = gain.mul(2)
  if (hasUpgrade("p", 21)) gain = gain.mul(upgradeEffect("p", 21))
  if (hasUpgrade("p", 22)) gain = gain.mul(3)
  if (hasUpgrade("p", 32)) gain = gain.mul(4)
  if (hasUpgrade("t", 11)) gain = gain.mul(upgradeEffect("t", 11))
  if (player.s.unlocked) gain = gain.mul(layers.s.singularityPowerBoost())
  if (player.i.unlocked) gain = gain.mul(layers.i.effect().incrementMult)
  if (player.c.unlocked) gain = gain.mul(buyableEffect("c", 11))
  if (!inChallenge("e", 12) && player.sh.unlocked) gain = gain.mul(buyableEffect("sh", 22))
  if (inChallenge("e", 21)) gain = gain.tetrate(1/12)
  if (hasChallenge("e", 21)) gain = gain.mul(layers.e.challenges[21].rewardEffect())
	return gain
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
}}

// Display extra things at the top of the page
var displayThings = [
  function() {return `Incrementali self-boost is ${format(getIncrementaliSelfBoost())}x`},
  function() {return `Self-boost base formula is log10(incrementali+3)^${format(getIncrementaliEff())}`}
]

// Determines when the game "ends"
function isEndgame() {
	return player.points.gte(new Decimal("e280000000"))
}



// Less important things beyond this point!

// Style for the background, can be a function
var backgroundStyle = {

}

// You can change this if you have things that can be messed up by long tick lengths
function maxTickLength() {
	return(3600) // Default is 1 hour which is just arbitrarily large
}

// Use this if you need to undo inflation from an older version. If the version is older than the version that fixed the issue,
// you can cap their current resources with this.
function fixOldSave(oldVersion){
}
