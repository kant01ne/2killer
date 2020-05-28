'use strict'
var _ = require('underscore')
const Model = use('Model')

class Assignment extends Model {
  constructor(players) {
    super()
    this.players = _.shuffle(_.map(players, (p) => new Player(p.name, p.ownKill)))
    this.kills = _.map(this.players, (p) => p.ownKill)
  }

  assign() {
    this.assignK(this.players[0])

    let res = _.map(this.players, (p) => {
      return {
        victimId: parseInt(p.victim.name),
        killerId: parseInt(p.killer.name),
        killId: parseInt(p.assignedKill)
      }
    })

    return res
  }

  // Given 4 players [A, B, C, D] with kills [KA, KB, KC, KD]. We want to assign a killer and a
  // victim (with a kill) to each one :
  // - A player can't be oneself's killer
  // - A player can't be oneself's victim
  // - A player can't be assigned his own kill
  // - A player can't be the victim of his own kill
  // - The killer->victim graph between all players can't have circual sub-graphs. Ex: A kills B, B
  // kills C, C kills A. This puts D outside the loop, with no one to kill but himself.
  // 
  // How this recursive algorithm works:
  // - If there are no kills left in the pool, we stop the assignment
  // - Shuffle the players [B, C, A, D]
  //
  // === First call === kills = [KA, KB, KC, KD]
  // - We start with the first player B
  // - Select a victim that is not the killer, that hasn't been assigned to a killer yet and is not
  // part of the killer's grand killers list. Ex. : D.
  // - If possible, select a kill that is neither the killer's or the victim's. Ex: KC
  // - Update the killer B(assignedKill: KC, victim: D) and the victim D(killer: B, grandKillers: [B])
  // - Remove KC from the kills list. list is now [KA, KB, KD]
  // - Call this function again with the previous victim D as the killer
  //
  // Graph:
  // B -> KC -> D
  //
  // === Second call === kills = [KA, KB, KD]
  // - Killer : D(killer: B, grandKillers: [B])
  // - Victim : A (can't be B as he is part of D's grandKillers. This avoids circular subgraphs).
  // - Kill : KB (can't be KA or KD)
  // - Update the killer D(victim: A, assignedKill: KB, killer: B, grandKillers: [B])
  // - Update the victim A(killer: D, grandKillers: [B, D])
  //
  // Graph:
  // B -> KC -> D -> KB -> A
  // 
  // === 3rd call === killls = [KA, KD]
  // Killer A, Victim C, Kill KD
  // Graph:
  // B -> KC -> D -> KB -> A -> KD -> C
  //
  // === 4th call === kills = [KA]
  // - The victim is necessarily the first player (hence the this.kills.length === 1
  // check, returning the first element of this.players)
  // Killer C, Victim B, Kill KA
  // Graph:
  // B -> KC -> D -> KB -> A -> KD -> C -> KA -> B
  // 
  // === 5th call === kills = []
  // END
  //
  // Edge cases are detailed below.
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
      this.kills = _.without(this.kills, kill)
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
      this.kills = _.without(this.kills, kill)
      kill = kkill
      console.log(killer.killer.toString())
    }

    victim.grandKillers = [...victim.grandKillers, ...killer.grandKillers, killer]
    victim.killer = killer
    killer.assignedKill = kill
    killer.victim = victim
    this.kills = _.without(this.kills, kill)
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

//var params = [
//]
//var r = new Assignment(
//  {name: "A", ownKill: "KA"},
//  {name: "B", ownKill: "KB"},
//  {name: "C", ownKill: "KC"},
//  {name: "D", ownKill: "KD"},
//  {name: "E", ownKill: "KE"},
//  {name: "F", ownKill: "KF"},
//  {name: "G", ownKill: "KG"},
//  {name: "H", ownKill: "KH"}
//).assign()
//
//console.info(r)

module.exports = Assignment
