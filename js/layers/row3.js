addLayer("t", {
        name: "portals", // This is optional, only used in a few places, If absent it just uses the layer id.
        symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
        position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
        startData() { return {
            unlocked: false,
		        points: new Decimal(0),
            best: new Decimal(0)
        }},
        color: "#32accd",
        requires: new Decimal(1e18), // Can be a function that takes requirement increases into account
        resource: "wormholes", // Name of prestige currency
        baseResource: "incrementali", // Name of resource prestige is based on
        baseAmount() {return player.points}, // Get the current amount of baseResource
        type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
        exponent: 0.5, // Prestige currency exponent
        gainMult() { // Calculate the multiplier for main currency from bonuses
            mult = new Decimal(1)
            return mult
        },
        gainExp() { // Calculate the exponent on main currency from bonuses
            return new Decimal(1)
        },
        row: 2, // Row the layer is in on the tree (0 is the first row)
        milestones: {
            0: {requirementDescription: "1 Wormholes",
                done() {return player[this.layer].best.gte(1)}, // Used to determine when to give the milestone
                effectDescription: "You keep singularity upgrades on reset.",
            },
            1: {requirementDescription: "4 Wormholes",
                done() {return player[this.layer].best.gte(4)}, // Used to determine when to give the milestone
                effectDescription: "You keep incrementali upgrades on reset.",
            },
            2: {requirementDescription: "9 Wormholes",
                done() {return player[this.layer].best.gte(9)}, // Used to determine when to give the milestone
                effectDescription: "You keep singularity levels and incrementali galaxies on reset.",
            },
            3: {requirementDescription: "13 Wormholes",
                done() {return player[this.layer].best.gte(13)}, // Used to determine when to give the milestone
                effectDescription: "You keep prestige upgrades on reset.",
            },
        },
        upgrades: {
            rows: 3,
            cols: 3,
            11: {
                description: "Incrementali is multiplied based on Wormholes.",
                cost() {
                  return new Decimal(1).add(player.t.upgrades.length)
                },
                unlocked() { return true},
                effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
                    let ret = player[this.layer].points.add(1).pow(2).mul(10)
                    if (ret.gt(1000)) ret = ret.cbrt().mul(100)
                    if (ret.gt(1e6)) ret = ret.cbrt().mul(1e4)
                    return ret;
                },
                effectDisplay() { return format(this.effect())+"x" }, // Add formatting to the effect
            },
            12: {
                description: "Incrementali self-boost power is increased by 10%.",
                cost() {
                  return new Decimal(1).add(player.t.upgrades.length)
                },
                unlocked() { return true},
            },
            21: {
                description: "Incrementali Galaxies are 5% stronger.",
                cost() {
                  return new Decimal(2).add(player.t.upgrades.length)
                },
                unlocked() { return true},
            },
            22: {
                description: "Singularity Levels are 5% stronger.",
                cost() {
                  return new Decimal(2).add(player.t.upgrades.length)
                },
                unlocked() { return true},
            },
        },
        hotkeys: [
            {key: "t", description: "T: Reset for time gems", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
        layerShown(){return player.i.points.gt(2) || player.t.unlocked},
        branches: ["i"], // When this layer appears, a branch will appear from this layer to any layers here. Each entry can be a pair consisting of a layer id and a color.
})

addLayer("e", {
        name: "environments", 
        symbol: "E", 
        position: 1,
        startData() { return {
                unlocked: true,
		            points: new Decimal(0),
                best: new Decimal(0),
                total: new Decimal(0),
                times: 0,
        }},
        color: "#1CA2E8",
        requires: new Decimal(0), 
        baseAmount() {return player.points}, 
        branches: ["t", "s"],
        type: "none",
        exponent: 0.5, // Prestige currency exponent
        tooltip() {
          return "Environments"
        },
        challenges:{
                rows: 2,
                cols: 2,
                11: {
                        name: "Volcano", 
                        challengeDescription: "The exponent for the Incrementali self-boost is divided by 25",
                        rewardEffect(){
                                let comps = challengeCompletions("e", 11)

                                let exp = Decimal.sqrt(comps).sub(1)

                                return Decimal.pow(1.5, exp)
                        },
                        rewardDescription: "Look below this.",
                        rewardDisplay() {
                                comps = "" + format(challengeCompletions("e", 11), 0) + "/" + format(25, 0) + " challenge completions"
                                if (challengeCompletions("e", 11) > 0) {
                                  comps += ", unlocking the shrine layer"
                                  comps += " and giving " + format(layers.e.challenges[11].rewardEffect()) + "x offerings."
                                }
                                return comps
                        },
                        unlocked(){
                                return true
                        },
                        goal(initial = false){
                                let comps = challengeCompletions("e", 11)
                                let init = 7.5
                                let exp = initial ? init : init + comps
                                return Decimal.pow(10, Decimal.mul(exp, 2))
                        },
                        onComplete() {
                          player.sh.unlocked = true
                        },
                        currencyInternalName: "points",
                        completionLimit: 25,
                    },
                12: {
                        name: "Depths", 
                        challengeDescription: "All shrine god effects are disabled.",
                        rewardEffect(){
                                let comps = challengeCompletions("e", 12)

                                let exp = Decimal.sqrt(comps)

                                return Decimal.pow(4, exp)
                        },
                        rewardDescription: "Look below this.",
                        rewardDisplay() {
                                comps = "" + format(challengeCompletions("e", 12), 0) + "/" + format(25, 0) + " challenge completions"
                                if (challengeCompletions("e", 12) > 0) {
                                  comps += ", unlocking the cult layer"
                                  comps += " and giving " + format(layers.e.challenges[12].rewardEffect()) + "x singularity power."
                                }
                                return comps
                        },
                        unlocked(){
                                return player.sh.unlocked
                        },
                        goal(initial = false){
                                let comps = challengeCompletions("e", 12)
                                let init = 10
                                let exp = initial ? init : init + comps
                                return Decimal.pow(10, Decimal.mul(exp, 1.5)).pow(2)
                        },
                        onComplete() {
                          player.sh.unlocked = true
                        },
                        currencyInternalName: "points",
                        completionLimit: 25,
                    },
                21: {
                        name: "Zenith", 
                        challengeDescription: "Incrementali gain is tetrated to the power of 1/12.",
                        rewardEffect(){
                                let comps = challengeCompletions("e", 21)

                                let exp = Decimal.sqrt(comps)

                                return Decimal.pow(25, exp)
                        },
                        rewardDescription: "Look below this.",
                        rewardDisplay() {
                                comps = "" + format(challengeCompletions("e", 21), 0) + "/" + format(25, 0) + " challenge completions"
                                if (challengeCompletions("e", 21) > 0) {
                                  comps += ", unlocking the ascension layer"
                                  comps += " and giving " + format(layers.e.challenges[21].rewardEffect()) + "x incrementali gain."
                                }
                                return comps
                        },
                        unlocked(){
                                return challengeCompletions("e", 12) > 1
                        },
                        goal(initial = false){
                                let comps = challengeCompletions("e", 21)
                                let init = 3
                                let exp = initial ? init : init + comps
                                return Decimal.pow(10, exp).pow(2)
                        },
                        onComplete() {
                          player.sh.unlocked = true
                        },
                        currencyInternalName: "points",
                        completionLimit: 25,
                    },
              },
        row: 2, // Row the layer is in on the tree (0 is the first row)
        layerShown(){return player.t.upgrades.length > 3},
        tabFormat: [
                                "blank",
                                "challenges",
                        ],
})

addLayer("c", {
        name: "cult", // This is optional, only used in a few places, If absent it just uses the layer id.
        symbol: "C", // This appears on the layer's node. Default is the id with the first letter capitalized
        position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
        startData() { return {
          unlocked: false,
			    points: new Decimal(0)
        }},
        color: "#e04c2b",
        requires: new Decimal(1e40), // Can be a function that takes requirement increases into account
        resource: "followers", // Name of prestige currency
        baseResource: "incrementali", // Name of resource prestige is based on
        baseAmount() {return player.points}, // Get the current amount of baseResource
        type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
        exponent: 1, // Prestige currency exponent
        base: 2,
        gainMult() { // Calculate the multiplier for main currency from bonuses
            mult = new Decimal(1)
            if (player.c.unlocked) mult = mult.div(buyableEffect("c", 12))
            return mult
        },
        gainExp() { // Calculate the exponent on main currency from bonuses
            let exp = new Decimal(1)
            return exp
        },
        canBuyMax() {return true},
        buyables: {
            rows: 1,
            cols: 3,
            11: {
                title: "Incremenkeeper", // Optional, displayed at the top in a larger font
                cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let base = new Decimal(1)
                    let mult = Decimal.pow(1.5,x)
                    if (mult.gt(25)) mult = mult.pow(2).div(25)
                    return base.mul(mult).floor()
                },
                effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                    let eff = Decimal.pow(2, x)
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Cost: " + format(data.cost) + " followers\n\
                    Amount: " + player[this.layer].buyables[this.id] + "\n\
                    Multiplies incrementali gain by " + format(data.effect) + "x"
                },
                unlocked() { return player[this.layer].unlocked }, 
                canAfford() {
                    return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player[this.layer].points = player[this.layer].points.sub(cost)	
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                buyMax() {}, // You'll have to handle this yourself if you want
                style: {'height':'222px'},
            },
            12: {
                title: "Evangelist", // Optional, displayed at the top in a larger font
                cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let base = new Decimal(3)
                    let mult = Decimal.pow(1.5,x)
                    if (mult.gt(25)) mult = mult.pow(2).div(25)
                    return base.mul(mult).floor()
                },
                effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                    let eff = Decimal.pow(3, x)
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Cost: " + format(data.cost) + " followers\n\
                    Amount: " + player[this.layer].buyables[this.id] + "\n\
                    Divides follower requirement by /" + format(data.effect)
                },
                unlocked() { return player[this.layer].unlocked }, 
                canAfford() {
                    return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player[this.layer].points = player[this.layer].points.sub(cost)	
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                buyMax() {}, // You'll have to handle this yourself if you want
                style: {'height':'222px'},
            },
            13: {
                title: "Mythologist", // Optional, displayed at the top in a larger font
                cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let base = new Decimal(6)
                    let mult = Decimal.pow(1.5,x)
                    if (mult.gt(25)) mult = mult.pow(2).div(25)
                    return base.mul(mult).floor()
                },
                effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                    let eff = {}
                    eff.first = Decimal.mul(1, x).min(3)
                    eff.second = Decimal.pow(1.1, x.sub(3).max(0))
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Cost: " + format(data.cost) + " followers\n\
                    Amount: " + player[this.layer].buyables[this.id] + "\n\
                    Unlocks "+format(data.effect.first, 0)+" new shrines, and makes shrines "+format(data.effect.second.sub(1).mul(100), 0)+"% stronger"
                },
                unlocked() { return player[this.layer].unlocked }, 
                canAfford() {
                    return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player[this.layer].points = player[this.layer].points.sub(cost)	
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                buyMax() {}, // You'll have to handle this yourself if you want
                style: {'height':'222px'},
            },
        },
        row: 2, // Row the layer is in on the tree (0 is the first row)
        hotkeys: [
            {key: "c", description: "C: Reset for cultists", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
        layerShown(){return challengeCompletions("e", 12) > 0 || player.c.unlocked},
        branches: ["sh", "e"], // When this layer appears, a branch will appear from this layer to any layers here. Each entry can be a pair consisting of a layer id and a color.
})
