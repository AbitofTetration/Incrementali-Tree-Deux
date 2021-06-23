addLayer("s", {
        name: "singularity", // This is optional, only used in a few places, If absent it just uses the layer id.
        symbol: "S", // This appears on the layer's node. Default is the id with the first letter capitalized
        position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
        startData() { return {
          unlocked: false,
			    points: new Decimal(0),
          power: new Decimal(0)
        }},
        color: "#888888",
        requires: new Decimal(500), // Can be a function that takes requirement increases into account
        resource: "singularity levels", // Name of prestige currency
        baseResource: "research points", // Name of resource prestige is based on
        baseAmount() {return player.p.points}, // Get the current amount of baseResource
        type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
        exponent: 0.85, // Prestige currency exponent
        base: 3,
        effect() {
          let base = player[this.layer].points
          if (hasUpgrade("t", 22)) base = base.mul(1.05)
          let eff = Decimal.pow(1.5, base).sub(1)
          if (hasUpgrade(this.layer, 12)) eff = eff.mul(upgradeEffect(this.layer, 12))
          if (hasUpgrade(this.layer, 21)) eff = eff.mul(upgradeEffect(this.layer, 21))
          if (player.q.unlocked) eff = eff.mul(buyableEffect("q", 12))
          if(eff.gt(1e7)) eff = eff.sqrt().mul(Decimal.sqrt(1e7))
          if (hasChallenge("e", 12)) eff = eff.mul(layers.e.challenges[12].rewardEffect())
          if (!inChallenge("e", 12) && player.sh.unlocked) mult = mult.mul(buyableEffect("sh", 31))
          return eff
        },
        effectDescription() {
          let eff = this.effect()
          return "giving "+format(eff)+" singularity power per second"
        },
        singularityPowerBoost() {
          let base = player[this.layer].power.add(1)
          
          let eff = Decimal.pow(base, 0.25)
          
          return eff
        },
        gainMult() { // Calculate the multiplier for main currency from bonuses
            mult = new Decimal(1)
            if (player[this.layer].points.gt(26)) mult = mult.div(100)
            if (player[this.layer].points.gt(30)) mult = mult.div(100)
            if (player[this.layer].points.gt(33)) mult = mult.div(1e8)
            if (player[this.layer].points.gt(84)) mult = mult.div(1e98)
            return mult
        },
        gainExp() { // Calculate the exponent on main currency from bonuses
            let exp = new Decimal(1)
            if (player[this.layer].points.gt(26)) exp = exp.div(1.25)
            if (player[this.layer].points.gt(30)) exp = exp.div(1.25)
            if (player[this.layer].points.gt(33)) exp = exp.div(1.5)
            if (player[this.layer].points.gt(84)) exp = exp.div(3)
            return exp
        },
        row: 1, // Row the layer is in on the tree (0 is the first row)
        milestones: {
            0: {requirementDescription: "6 Singularity Levels",
                done() {return player[this.layer].points.gte(6)}, // Used to determine when to give the milestone
                effectDescription: "You keep prestige upgrades on reset.",
            },
            1: {requirementDescription: "19 Singularity Levels",
                unlocked() {return player.i.unlocked},
                done() {return player[this.layer].points.gte(19)}, // Used to determine when to give the milestone
                effectDescription: "You gain 10% of prestige points on reset per second.",
            },
        },
        doReset(resettingLayer){ // Triggers when this layer is being reset, along with the layer doing the resetting. Not triggered by lower layers resetting, but is by layers on the same row.
            if(layers[resettingLayer].row > this.row) {
              if (resettingLayer == "t" || resettingLayer == "e" || resettingLayer == "c") {
                if (hasMilestone("t", 2)) {
                  layerDataReset(this.layer, ["upgrades", "points"])
                } else if (hasMilestone("t", 0)) {
                  layerDataReset(this.layer, ["upgrades"])
                } else {
                  layerDataReset(this.layer) // This is actually the default behavior
                }
              }
            }
            return
        },
        upgrades: {
            rows: 2,
            cols: 3,
            11: {
                description: "Incrementali boost is 2% more effective.",
                cost: new Decimal(5),
                currencyDisplayName: "singularity power", // Use if using a nonstandard currency
                currencyLocation() {return player[this.layer]}, // The object in player data that the currency is contained in
                currencyInternalName: "power", // Use if using a nonstandard currency
                unlocked() { return true},
            },
            12: {
                description: "Singularity power gain is multiplied by incrementali.",
                cost: new Decimal(75),
                currencyDisplayName: "singularity power", // Use if using a nonstandard currency
                currencyLocation() {return player[this.layer]}, // The object in player data that the currency is contained in
                currencyInternalName: "power", // Use if using a nonstandard currency
                unlocked() { return hasUpgrade(this.layer, 11)},
                effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
                    let ret = player.points.add(1).log10().add(1).log10().add(1)
                    return ret;
                },
                effectDisplay() { return format(this.effect())+"x" }, // Add formatting to the effect
            },
            13: {
                description: "Permanently unlock a Singularity Rune.",
                cost: new Decimal(500),
                currencyDisplayName: "singularity power", // Use if using a nonstandard currency
                currencyLocation() {return player[this.layer]}, // The object in player data that the currency is contained in
                currencyInternalName: "power", // Use if using a nonstandard currency
                unlocked() { return hasUpgrade(this.layer, 12)},
            },
            21: {
                description: "Singularity power gain is multiplied by singularity power.",
                cost: new Decimal(10000),
                currencyDisplayName: "singularity power", // Use if using a nonstandard currency
                currencyLocation() {return player[this.layer]}, // The object in player data that the currency is contained in
                currencyInternalName: "power", // Use if using a nonstandard currency
                unlocked() { return hasUpgrade(this.layer, 13)},
                effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
                    let ret = player[this.layer].power.add(1).log10().add(1).sqrt()
                    return ret;
                },
                effectDisplay() { return format(this.effect())+"x" }, // Add formatting to the effect
            },
            22: {
                description: "Prestige point gain is multiplied by singularity power.",
                cost: new Decimal(90000),
                currencyDisplayName: "singularity power", // Use if using a nonstandard currency
                currencyLocation() {return player[this.layer]}, // The object in player data that the currency is contained in
                currencyInternalName: "power", // Use if using a nonstandard currency
                unlocked() { return hasUpgrade(this.layer, 21)},
                effect() { // Calculate bonuses from the upgrade. Can return a single value or an object with multiple values
                    let ret = player[this.layer].power.add(1).log10().add(1)
                    return ret;
                },
                effectDisplay() { return format(this.effect())+"x" }, // Add formatting to the effect
            },
        },
        update(diff) {
          if (player.s.unlocked) player[this.layer].power = player[this.layer].power.add(layers.s.effect().mul(diff))
        },
        hotkeys: [
            {key: "s", description: "S: Reset for singularity levels", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
        midsection: [
            ["display-text", function() {return "You have "+format(player.s.power)+" singularity power, multiplying incrementali gain by "+format(layers.s.singularityPowerBoost())+"x"}],
        ],
        layerShown(){return player.p.best.gt(45) || player.s.unlocked},
        branches: ["p"], // When this layer appears, a branch will appear from this layer to any layers here. Each entry can be a pair consisting of a layer id and a color.
})

addLayer("i", {
        name: "galaxy", // This is optional, only used in a few places, If absent it just uses the layer id.
        symbol: "I", // This appears on the layer's node. Default is the id with the first letter capitalized
        position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
        startData() { return {
          unlocked: false,
			    points: new Decimal(0)
        }},
        color: "#bfbf00",
        requires: new Decimal(2e8), // Can be a function that takes requirement increases into account
        resource: "incrementali galaxies", // Name of prestige currency
        baseResource: "incrementali", // Name of resource prestige is based on
        baseAmount() {return player.points}, // Get the current amount of baseResource
        type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
        exponent: 0.75, // Prestige currency exponent
        base: 10,
        effect() {
          let base = player[this.layer].points
          if (hasUpgrade("t", 21)) base = base.mul(1.05)
          let eff = {
            incrementMult: new Decimal.pow(5, base.sqrt()),
            incrementBuff: new Decimal.pow(1.05, base.sqrt())
          }
            let set = {
              incrementMult: new Decimal(25),
              incrementBuff: new Decimal(1.1),
            }
            let set2 = {
              incrementMult: new Decimal(4e4),
              incrementBuff: new Decimal(1.4),
            }
          for (var i in eff) {
            if (eff[i].gt(set[i])) {
              eff[i] = eff[i].sqrt().mul(set[i].sqrt())
            }
          }
          for (var i in eff) {
            if (eff[i].gt(set2[i])) {
              eff[i] = eff[i].cbrt().mul(set2[i].pow(2/3))
            }
          }
          return eff
        },
        effectDescription() {
          let eff = this.effect()
          return "multiplying incrementali gain by "+format(eff.incrementMult)+"x and increasing the exponent of the self-boost by "+format(eff.incrementBuff.sub(1).mul(100))+"%"
        },
        gainMult() { // Calculate the multiplier for main currency from bonuses
            mult = new Decimal(1)
            if (player[this.layer].points.gt(103)) mult = mult.div(1e25)
            if (player[this.layer].points.gt(134)) mult = mult.div(1e50)
            if (player[this.layer].points.gt(150)) mult = mult.div(1e250)
            if (player.sh.unlocked) mult = mult.div(buyableEffect("sh", 33))
            return mult
        },
        gainExp() { // Calculate the exponent on main currency from bonuses
            let exp = new Decimal(1)
            if (player[this.layer].points.gt(103)) exp = exp.div(1.75)
            if (player[this.layer].points.gt(134)) exp = exp.div(1.75)
            if (player[this.layer].points.gt(150)) exp = exp.div(3)
            return exp
        },
        doReset(resettingLayer){ // Triggers when this layer is being reset, along with the layer doing the resetting. Not triggered by lower layers resetting, but is by layers on the same row.
            if(layers[resettingLayer].row > this.row) {
              if (resettingLayer == "t" || resettingLayer == "e" || resettingLayer == "c") {
                if (hasMilestone("t", 2)) {
                  layerDataReset(this.layer, ["buyables", "points"])
                } else if (hasMilestone("t", 0)) {
                  layerDataReset(this.layer, ["buyables"])
                } else {
                  layerDataReset(this.layer) // This is actually the default behavior
                }
              }
            }
            return
        },
        buyables: {
            rows: 1,
            cols: 3,
            showRespec: true,
            respec() { // Optional, reset things and give back your currency. Having this function makes a respec button appear
                resetBuyables(this.layer)
                doReset(this.layer, true) // Force a reset
            },
            respecText: "Respec Upgrades", // Text on Respec button, optional
            11: {
                title: "Increment Upgrade", // Optional, displayed at the top in a larger font
                cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let base = new Decimal(1e9)
                    let mult = Decimal.pow(10,x)
                    if (mult.gt(1e6)) mult = mult.pow(2).div(1e6)
                    return base.mul(mult)
                },
                effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                    let eff = Decimal.div(x, 5).add(1).sqrt()
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Cost: " + format(data.cost) + " incrementali\n\
                    Amount: " + player[this.layer].buyables[this.id] + "\n\
                    Boosts the incrementali effect by " + format(data.effect.sub(1).mul(100), 0) + "%"
                },
                unlocked() { return player[this.layer].unlocked }, 
                canAfford() {
                    return player.points.gte(tmp[this.layer].buyables[this.id].cost)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player.points = player.points.sub(cost)	
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                buyMax() {}, // You'll have to handle this yourself if you want
                style: {'height':'222px'},
            },
            12: {
                title: "Prestige Upgrade", // Optional, displayed at the top in a larger font
                cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    let base = new Decimal(1e10)
                    let mult = Decimal.pow(100,x)
                    if (mult.gt(1e9)) mult = mult.pow(2).div(1e9)
                    return base.mul(mult)
                },
                effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                    let eff = Decimal.div(x, 6).add(1).pow(12)
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Cost: " + format(data.cost) + " incrementali\n\
                    Amount: " + player[this.layer].buyables[this.id] + "\n\
                    Multiplies prestige point gain by " + format(data.effect) + "x"
                },
                unlocked() { return player[this.layer].unlocked }, 
                canAfford() {
                    return player.points.gte(tmp[this.layer].buyables[this.id].cost)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player.points = player.points.sub(cost)	
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                },
                buyMax() {}, // You'll have to handle this yourself if you want
                style: {'height':'222px'},
            },
        },
        row: 1, // Row the layer is in on the tree (0 is the first row)
        milestones: {
            0: {requirementDescription: "4 Incrementali Galaxies",
                done() {return player[this.layer].points.gte(4)}, // Used to determine when to give the milestone
                effectDescription: "You keep prestige upgrades on reset.",
            },
        },
        hotkeys: [
            {key: "i", description: "I: Reset for incrementali galaxies", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
        layerShown(){return player.s.points.gte(6) || player.i.unlocked},
        branches: ["p"], // When this layer appears, a branch will appear from this layer to any layers here. Each entry can be a pair consisting of a layer id and a color.
})

addLayer("sh", {
        name: "shrine", // This is optional, only used in a few places, If absent it just uses the layer id.
        symbol: "Sh", // This appears on the layer's node. Default is the id with the first letter capitalized
        position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
        startData() { return {
          unlocked: false,
			    points: new Decimal(0),
        }},
        color: "#dcbfaa",
        requires: new Decimal(0), // Can be a function that takes requirement increases into account
        baseAmount() {return player.points}, // Get the current amount of baseResource
        resource: "offerings", // Name of prestige currency
        type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
        getGain() {
          let gain = player.points.add(1).log10().add(1).log10().add(1).log10()
          if (!inChallenge("e", 12) && player.sh.unlocked) gain = gain.mul(buyableEffect("sh", 11))
          if (hasChallenge("e", 11)) gain = gain.mul(layers.e.challenges[11].rewardEffect())
          return gain
        },
        gainMult() { // Calculate the multiplier for main currency from bonuses
            mult = new Decimal(1)
            return mult
        },
        gainExp() { // Calculate the exponent on main currency from bonuses
            let exp = new Decimal(1)
            return exp
        },
        row: 1, // Row the layer is in on the tree (0 is the first row)
        doReset(resettingLayer){ // Triggers when this layer is being reset, along with the layer doing the resetting. Not triggered by lower layers resetting, but is by layers on the same row.
            if(layers[resettingLayer].row > this.row) {
              if (resettingLayer == "t" || resettingLayer == "e" || resettingLayer == "c") {
                layerDataReset(this.layer, ["buyables"])
              }
            }
            return
        },
        update(diff) {
          if (player.sh.unlocked) player[this.layer].points = player[this.layer].points.add(layers.sh.getGain().mul(diff))
        },
        getShrinePower() {
          let eff = new Decimal(1)
          if (player.c.unlocked) eff = eff.mul(buyableEffect("c", 13).second)
          return eff
        },
        getTotalBuyables() {
          let set = [11, 21, 22, 31, 32, 33]
          let total = new Decimal(0)
          for (var i in set) {
            total = total.add(player.sh.buyables[set[i]])
          }
          return total
        },
        buyables: {
            rows: 3,
            cols: 3,
            11: {
                title: "Zeus", // Optional, displayed at the top in a larger font
                cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    if (x.gt(10)) x = x.pow(2).div(10)
                    let cost = Decimal.pow(10, x.sqrt()).mul(1)
                    return cost.floor()
                },
                effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                    if (x.gt(20)) x = x.sqrt().mul(Decimal.sqrt(20))
                    x = x.mul(layers.sh.getShrinePower())
                    let eff = Decimal.pow(1.5, x)
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Cost: " + format(data.cost) + " offerings\n\
                    Level: " + player[this.layer].buyables[this.id] + "\n\
                    Multiplies offering gain by " + format(data.effect) + "x"
                },
                unlocked() { return player[this.layer].unlocked }, 
                canAfford() {
                    return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player[this.layer].points = player[this.layer].points.sub(cost)	
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                    player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(cost) // This is a built-in system that you can use for respeccing but it only works with a single Decimal value
                },
                buyMax() {}, // You'll have to handle this yourself if you want
                style: {'height':'125px','width':'125px'},
            },
            21: {
                title: "Midas", // Optional, displayed at the top in a larger font
                cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    if (x.gt(10)) x = x.pow(2).div(10)
                    let cost = Decimal.pow(10, x.sqrt()).mul(5)
                    return cost.floor()
                },
                effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                    x = x.mul(layers.sh.getShrinePower())
                    let eff = Decimal.pow(8, x.sqrt())
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Cost: " + format(data.cost) + " offerings\n\
                    Level: " + player[this.layer].buyables[this.id] + "\n\
                    Multiplies research point gain by " + format(data.effect) + "x"
                },
                unlocked() { return player[this.layer].unlocked }, 
                canAfford() {
                    return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player[this.layer].points = player[this.layer].points.sub(cost)	
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                    player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(cost) // This is a built-in system that you can use for respeccing but it only works with a single Decimal value
                },
                buyMax() {}, // You'll have to handle this yourself if you want
                style: {'height':'125px','width':'125px'},
            },
            22: {
                title: "Persephone", // Optional, displayed at the top in a larger font
                cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    if (x.gt(10)) x = x.pow(2).div(10)
                    let cost = Decimal.pow(10, x.sqrt()).mul(5)
                    return cost.floor()
                },
                effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                    x = x.mul(layers.sh.getShrinePower())
                    let eff = Decimal.pow(25, x.sqrt())
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Cost: " + format(data.cost) + " offerings\n\
                    Level: " + player[this.layer].buyables[this.id] + "\n\
                    Multiplies incrementali gain by " + format(data.effect) + "x"
                },
                unlocked() { return player[this.layer].unlocked }, 
                canAfford() {
                    return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player[this.layer].points = player[this.layer].points.sub(cost)	
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                    player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(cost) // This is a built-in system that you can use for respeccing but it only works with a single Decimal value
                },
                buyMax() {}, // You'll have to handle this yourself if you want
                style: {'height':'125px','width':'125px'},
            },
            31: {
                title: "Coeus", // Optional, displayed at the top in a larger font
                cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    if (x.gt(10)) x = x.pow(2).div(10)
                    let cost = Decimal.pow(10, x.sqrt()).mul(100)
                    return cost.floor()
                },
                effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                    x = x.mul(layers.sh.getShrinePower())
                    let eff = Decimal.pow(12, x.sqrt())
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Cost: " + format(data.cost) + " offerings\n\
                    Level: " + player[this.layer].buyables[this.id] + "\n\
                    Multiplies singularity power gain by " + format(data.effect) + "x"
                },
                unlocked() { return layers.c.buyables[13].effect().first.gte(1) }, 
                canAfford() {
                    return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player[this.layer].points = player[this.layer].points.sub(cost)	
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                    player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(cost) // This is a built-in system that you can use for respeccing but it only works with a single Decimal value
                },
                buyMax() {}, // You'll have to handle this yourself if you want
                style: {'height':'125px','width':'125px'},
            },
            32: {
                title: "Psyche", // Optional, displayed at the top in a larger font
                cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    if (x.gt(10)) x = x.pow(2).div(10)
                    let cost = Decimal.pow(10, x.sqrt()).mul(100)
                    return cost.floor()
                },
                effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                    x = x.mul(layers.sh.getShrinePower())
                    let eff = Decimal.mul(0.03, x).add(1)
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Cost: " + format(data.cost) + " offerings\n\
                    Level: " + player[this.layer].buyables[this.id] + "\n\
                    Incrementali self-boost is increased by " + format(data.effect.sub(1).mul(100), 0) + "%"
                },
                unlocked() { return layers.c.buyables[13].effect().first.gte(2) }, 
                canAfford() {
                    return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player[this.layer].points = player[this.layer].points.sub(cost)	
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                    player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(cost) // This is a built-in system that you can use for respeccing but it only works with a single Decimal value
                },
                buyMax() {}, // You'll have to handle this yourself if you want
                style: {'height':'125px','width':'125px'},
            },
            33: {
                title: "Aether", // Optional, displayed at the top in a larger font
                cost(x=player[this.layer].buyables[this.id]) { // cost for buying xth buyable, can be an object if there are multiple currencies
                    if (x.gt(10)) x = x.pow(2).div(10)
                    let cost = Decimal.pow(10, x.sqrt()).mul(100)
                    return cost.floor()
                },
                effect(x=player[this.layer].buyables[this.id]) { // Effects of owning x of the items, x is a decimal
                    x = x.mul(layers.sh.getShrinePower())
                    let eff = Decimal.mul(0.1, x).add(1)
                    return eff;
                },
                display() { // Everything else displayed in the buyable button after the title
                    let data = tmp[this.layer].buyables[this.id]
                    return "Cost: " + format(data.cost) + " offerings\n\
                    Level: " + player[this.layer].buyables[this.id] + "\n\
                    Get " + format(data.effect.sub(1).mul(100), 0) + "% more galaxies"
                },
                unlocked() { return layers.c.buyables[13].effect().first.gte(3) }, 
                canAfford() {
                    return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost)},
                buy() { 
                    cost = tmp[this.layer].buyables[this.id].cost
                    player[this.layer].points = player[this.layer].points.sub(cost)	
                    player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                    player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(cost) // This is a built-in system that you can use for respeccing but it only works with a single Decimal value
                },
                buyMax() {}, // You'll have to handle this yourself if you want
                style: {'height':'125px','width':'125px'},
            },
        },
        layerShown(){return challengeCompletions("e", 11) > 0},
        branches: ["e"], // When this layer appears, a branch will appear from this layer to any layers here. Each entry can be a pair consisting of a layer id and a color.
        tabFormat: [
                                "main-display",
                                ["display-text", function() {return "You are getting "+format(layers.sh.getGain())+" offerings per second from your incrementali." }],
                                "blank",
                                "buyables",
                        ],
})
