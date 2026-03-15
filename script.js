javascript
const SUPABASE_URL = "https://eijqtqlvdtggyvqhchya.supabase.co"
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpanF0cWx2ZHRnZ3l2cWhjaHlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0NjE1MDksImV4cCI6MjA4OTAzNzUwOX0.qAdJDwMLgqf7baaSd_BrCKMUl_j47OkqAguEK4k8p6s"

const { createClient } = window.supabase
const client = createClient(SUPABASE_URL, SUPABASE_KEY)

const list = document.getElementById("list")
const boughtList = document.getElementById("boughtList")
const form = document.getElementById("form")

const imageInput = document.getElementById("image")
const imageFile = document.getElementById("imageFile")
const preview = document.getElementById("preview")

let editingId = null

let sortField = "desire"
let sortDirection = "desc"



/* ---------------------------
   STAR RATING SELECTOR
----------------------------*/

const stars = document.querySelectorAll(".star")
const desireInput = document.getElementById("desire")

stars.forEach(star => {

star.addEventListener("click", () => {

const value = star.dataset.value
desireInput.value = value

stars.forEach(s => s.classList.remove("active"))

for(let i=0;i<value;i++){
stars[i].classList.add("active")
}

})

})



/* ---------------------------
   IMAGE PREVIEW
----------------------------*/

imageInput.addEventListener("input", () => {

preview.src = imageInput.value
preview.style.display = "block"

})

imageFile.addEventListener("change", () => {

const file = imageFile.files[0]
if(!file) return

const reader = new FileReader()

reader.onload = e => {

preview.src = e.target.result
preview.style.display = "block"

}

reader.readAsDataURL(file)

})



/* ---------------------------
   LOAD ITEMS
----------------------------*/

async function loadItems(){

const { data, error } = await client
.from("wishlist")
.select("*")
.order(sortField, { ascending: sortDirection === "asc" })

if(error){
console.error(error)
list.innerHTML = "Error loading items"
return
}

list.innerHTML = ""
boughtList.innerHTML = ""

if(!data || data.length === 0){
list.innerHTML = "<p>No wishlist items yet.</p>"
return
}

data.forEach(item => {

const div = document.createElement("div")
div.className = "item"

const img = item.image
? `<img class="thumb" src="${item.image}">`
: `<div class="thumb"></div>`

div.innerHTML = `
${img}

<div class="item-info">
<strong>${item.name}</strong>
<span>${item.price ? item.price + " k VND" : ""}</span>
<span>${"⭐".repeat(item.desire || 1)}</span>
<a href="${item.link}" target="_blank">Open link</a>
</div>

<div class="item-actions">
<button class="buy-btn" data-id="${item.id}">✓</button>
<button class="edit-btn" data-id="${item.id}">Edit</button>
<button class="delete-btn" data-id="${item.id}">Delete</button>
</div>
`

if(item.bought){
boughtList.appendChild(div)
}else{
list.appendChild(div)
}

})

}



/* ---------------------------
   FORM SUBMIT
----------------------------*/

form.addEventListener("submit", async e => {

e.preventDefault()

let imageValue = imageInput.value

if(imageFile.files[0]){

const reader = new FileReader()

reader.onload = async ev => {

imageValue = ev.target.result
await saveItem(imageValue)

}

reader.readAsDataURL(imageFile.files[0])

}else{

await saveItem(imageValue)

}

})



async function saveItem(imageValue){

const item = {

name: document.getElementById("name").value,
price: parseInt(document.getElementById("price").value) || null,
link: document.getElementById("link").value,
desire: parseInt(desireInput.value),
image: imageValue,
bought:false

}

if(editingId){

await client
.from("wishlist")
.update(item)
.eq("id", editingId)

editingId = null

}else{

await client
.from("wishlist")
.insert([item])

}

form.reset()
preview.style.display="none"

stars.forEach(s=>s.classList.remove("active"))

loadItems()

}



/* ---------------------------
   ITEM ACTIONS
----------------------------*/

document.addEventListener("click", async e => {

if(e.target.classList.contains("delete-btn")){

const id = e.target.dataset.id

await client
.from("wishlist")
.delete()
.eq("id", id)

loadItems()

}



if(e.target.classList.contains("buy-btn")){

const id = e.target.dataset.id

await client
.from("wishlist")
.update({ bought:true })
.eq("id", id)

loadItems()

}



if(e.target.classList.contains("edit-btn")){

const id = e.target.dataset.id

const { data } = await client
.from("wishlist")
.select("*")
.eq("id", id)
.single()

document.getElementById("name").value = data.name
document.getElementById("price").value = data.price
document.getElementById("link").value = data.link
imageInput.value = data.image

preview.src = data.image
preview.style.display="block"

desireInput.value = data.desire

stars.forEach(s=>s.classList.remove("active"))

for(let i=0;i<data.desire;i++){
stars[i].classList.add("active")
}

editingId = id

}

})



/* ---------------------------
   SORTING
----------------------------*/

document.getElementById("sortBtn").addEventListener("click", () => {

sortField = document.getElementById("sortField").value
sortDirection = document.getElementById("sortDirection").value

loadItems()

})



/* ---------------------------
   INITIAL LOAD
----------------------------*/

loadItems()
