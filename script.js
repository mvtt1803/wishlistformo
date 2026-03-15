const SUPABASE_URL = "https://eijqtqlvdtggyvqhchya.supabase.co"
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpanF0cWx2ZHRnZ3l2cWhjaHlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0NjE1MDksImV4cCI6MjA4OTAzNzUwOX0.qAdJDwMLgqf7baaSd_BrCKMUl_j47OkqAguEK4k8p6s"

const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY)

const list = document.getElementById("list")
const form = document.getElementById("form")

async function loadItems() {

const { data, error } = await client
  .from("wishlist")
  .select("*")
  .order("desire", { ascending: false })

if (error) {
  console.error("Supabase error:", error)
  list.innerHTML = "Error loading items"
  return
}

list.innerHTML = ""

if (!data || data.length === 0) {
  list.innerHTML = "<p>No wishlist items yet.</p>"
  return
}

data.forEach(item => {

  const div = document.createElement("div")
  div.className = "item"

  div.innerHTML = `
    <strong>${item.name}</strong><br>
    ${item.price ? item.price + " k VND" : ""}<br>
    ${"⭐".repeat(item.desire)}<br>
    <a href="${item.link}" target="_blank">Open link</a>
  `

  list.appendChild(div)

})

}

form.addEventListener("submit", async e => {

e.preventDefault()

const item = {
  name: document.getElementById("name").value,
  price: parseInt(document.getElementById("price").value) || null,
  link: document.getElementById("link").value,
  desire: parseInt(document.getElementById("desire").value)
}

const { error } = await client
  .from("wishlist")
  .insert([item])

if (error) {
  console.error("Insert error:", error)
}

form.reset()

loadItems()

})

loadItems()