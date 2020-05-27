'use strict'
var _ = require('lodash')

class Assignment {
  constructor(...players) {
    this.players = _.shuffle(_.flatMap(players, (p) => new Player(p.name, p.ownKill)))
    this.kills = _.flatMap(this.players, (p) => p.ownKill)
  }

  assign() {
    this.assignK(this.players[0])
  }

  assignK(killer) {
    if (this.kills.length === 0) {
      return this.players
    }

    var victim = _.find(this.players, (v) => (this.kills.length === 1) || (v.name !== killer.name && !v.has_a_killer() && !_.includes(killer.grandKillers, v)))
    var kill = _.find(this.kills, (k) => k != killer.ownKill && k != victim.ownKill)
    if (kill === undefined) kill = this.kills[0]

    // Case where remaining kill is the killer's (KD) :
    // (A) -> KC -> (B) -> KA -> (C) -> KB -> (D) -> ? -> (A).
    // We can't assign KD above. We swap KD with the victim's (A) assigned kill (KC). We know that KC is
    // neither D's kill nor A's kill.
    // Result: (A) -> KD -> (B) -> KA -> (C) -> KB -> (D) -> KC -> (A) 
    if (killer.ownKill === kill && victim.victim != undefined) {
      console.log(`!! killer's own kill !! killer=${killer.name} kill=${kill} victim=${victim.name}`)
      var vkill = victim.assignedKill
      victim.assignedKill = kill
      _.remove(this.kills, (e) => e === kill)
      kill = vkill
      console.log(victim.toString())
      // The previous case assumes the victim (A) has an assigned kill. If this is not the case, we
      // take the next kill on the list (which is necessarily the victim's kill).
    } else if (killer.ownKill === kill) {
      kill = this.kills[1]
      console.log(`!! killer's own kill !! no victim yet for the current victim ${victim.name} - newKill = ${kill}`)
    }

    // Ex where remaining kill is the victim's (KA) :
    // (A) -> KC -> (B) -> KD -> (C) -> KB -> (D) -> ? -> (A).
    // We can't assign KD above. So we swap KA with D's killer's (C) kill (KB). We know that KB is not
    // D's kill nor A's kill.
    // Result: (A) -> KC -> (B) -> KD -> (C) -> KA -> (D) -> KB -> (A) 
    if (victim.ownKill === kill) {
      console.log(`!! victim's own kill !! killer=${killer.name} kill=${kill} victim=${victim.name}`)
      var kkill = killer.killer.assignedKill
      killer.killer.assignedKill = kill
      _.remove(this.kills, (e) => e === kill)
      kill = kkill
      console.log(killer.killer.toString())
    }

    victim.grandKillers = [...victim.grandKillers, ...killer.grandKillers, killer]
    victim.killer = killer
    killer.assignedKill = kill
    killer.victim = victim
    _.remove(this.kills, (e) => e === kill)
    console.log(killer.toString())
    this.assignK(killer.victim)
  }
}

class Player {
  constructor(name, ownKill) {
    this.name = name
    this.ownKill = ownKill
    this.grandKillers = []
    this.killer = null
    this.victim = null
    this.assignedKill = null
  }

  has_a_killer() {
    this.killer !== null
  }

  toString() {
    return `${this.name} -> ${this.assignedKill} -> ${this.victim.name}`
  }
}

var params = [
]
var r = new Assignment(
  {name: "A", ownKill: "KA"},
  {name: "B", ownKill: "KB"},
  {name: "C", ownKill: "KC"},
  {name: "D", ownKill: "KD"},
  {name: "E", ownKill: "KE"},
  {name: "F", ownKill: "KF"},
  {name: "G", ownKill: "KG"},
  {name: "H", ownKill: "KH"}
).assign()

console.info(r)
