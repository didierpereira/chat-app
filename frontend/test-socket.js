import { io } from "socket.io-client"

const BASE = "http://localhost:5001"

const a = io(BASE, { query: { userId: "userA" } })
const b = io(BASE, { query: { userId: "userB" } })

const wait = (ms) => new Promise((r) => setTimeout(r, ms))

const run = async () => {
  a.on("connect", () => console.log("A connected", a.id))
  b.on("connect", () => console.log("B connected", b.id))

  b.on("typing", ({ from }) => console.log("B received typing from", from))
  b.on("stopTyping", ({ from }) => console.log("B received stopTyping from", from))

  await wait(1000)
  console.log("A emits typing -> B")
  a.emit("typing", { to: "userB", from: "userA" })

  await wait(1000)
  console.log("A emits stopTyping -> B")
  a.emit("stopTyping", { to: "userB", from: "userA" })

  await wait(1000)
  a.disconnect()
  b.disconnect()
}

run().catch(console.error)
