const SUPABASE_URL = "https://eijqtqlvdtggyvqhchya.supabase.co"
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpanF0cWx2ZHRnZ3l2cWhjaHlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0NjE1MDksImV4cCI6MjA4OTAzNzUwOX0.qAdJDwMLgqf7baaSd_BrCKMUl_j47OkqAguEK4k8p6s"

const { createClient } = window.supabase
const client = createClient(SUPABASE_URL, SUPABASE_KEY)

const list = document.getElementById("list")
const boughtList = document.getElementById("boughtList")
const form = document.getElementById("form")
const imageInput = document.getElementById("image")
const fileInput = document.getElementById("imageUpload")
const preview = document.getElementById("preview")

let uploadedImage = null
let sortField = "desire"
let sortDirection = "desc"



async function loadItems(){

const { data, error } = await client
.from("wishlist")
.select("*")
.order(sortField,{ascending: sortDirection==="asc"})

if(error){
console.error("Supabase error:",error)
list.innerHTML="Error loading items"
return
}

list.style.opacity = 0
boughtList.style.opacity = 0

setTimeout(() => {

list.innerHTML=""
boughtList.innerHTML=""

},120)

if(!data || data.length===0){
list.innerHTML="<p>Mo is satisfied (for now).</p>"
return
}

data.forEach(item=>{

const container = item.bought ? boughtList : list

const div=document.createElement("div")
div.className="item"

div.innerHTML=`

<img class="thumb" src="${item.image || 'https://placehold.co/80x80?text=%F0%9F%8E%81'}">

<div class="item-info">
<strong>${item.name}</strong>
<span>${item.price ? item.price+" k":""}</span>
<span>${"⭐".repeat(item.desire || 1)}</span>
${item.link ? `<a href="${item.link}" target="_blank">Open link</a>`:""}
</div>

<div class="item-actions">

<button class="buy-btn" data-id="${item.id}">
${item.bought ? "Undo":"Bought"}
</button>

<button class="edit-btn" data-id="${item.id}">
Edit
</button>

<button class="delete-btn" data-id="${item.id}">
Delete
</button>

</div>
`

container.appendChild(div)

})

}

imageInput.addEventListener("input", () => {

if(imageInput.value){

preview.src = imageInput.value
preview.style.display = "block"
uploadedImage = imageInput.value

}

})

fileInput.addEventListener("change", () => {

const file = fileInput.files[0]

if(!file) return

const reader = new FileReader()

reader.onload = function(e){

preview.src = e.target.result
preview.style.display = "block"

uploadedImage = e.target.result

}

reader.readAsDataURL(file)

})

form.addEventListener("submit", async e => {

e.preventDefault()

const item = {
name: document.getElementById("name").value.trim(),
price: parseInt(document.getElementById("price").value) || null,
link: document.getElementById("link").value.trim(),
desire: parseInt(document.getElementById("desire").value),
image: uploadedImage || null,
bought:false
}

const { error } = await client
.from("wishlist")
.insert([item])

if(error){
console.error("Insert error:",error)
return
}

form.reset()

uploadedImage = null
preview.style.display = "none"
preview.src = ""

loadItems()

})



list.addEventListener("click",handleActions)
boughtList.addEventListener("click",handleActions)



async function handleActions(e){

const id=e.target.dataset.id

if(e.target.classList.contains("delete-btn")){

await client
.from("wishlist")
.delete()
.eq("id",id)

loadItems()

}

const stars = document.querySelectorAll(".star")
const desireInput = document.getElementById("desire")

stars.forEach(star => {

star.addEventListener("click", () => {

const value = star.dataset.value
desireInput.value = value

stars.forEach(s => {
s.classList.remove("active")
})

for(let i = 0; i < value; i++){
stars[i].classList.add("active")
}

})

})

if(e.target.classList.contains("buy-btn")){

const isUndo = e.target.textContent==="Undo"

await client
.from("wishlist")
.update({bought:!isUndo})
.eq("id",id)

loadItems()

}



if(e.target.classList.contains("edit-btn")){

const newName = prompt("Edit item name")
const newPrice = prompt("Edit price (k)")

if(!newName) return

await client
.from("wishlist")
.update({
name:newName,
price: parseInt(newPrice) || null
})
.eq("id",id)

loadItems()

}

}



document.getElementById("sortBtn").addEventListener("click",()=>{

sortField=document.getElementById("sortField").value
sortDirection=document.getElementById("sortDirection").value

loadItems()

})

loadItems()

setTimeout(() => {

list.style.opacity = 1
boughtList.style.opacity = 1

},150)