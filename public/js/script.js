const canvas=document.querySelector('canvas');
const scoreEl=document.querySelector('#scoreEl');
const c=canvas.getContext('2d');
canvas.width=1064;
canvas.height=546;
// player class
class Player{
    constructor(){
        this.velocity= {
            x:0,
            y:0
        }
        this.opacity=1;
        const image=new Image()
        image.src='images/spaceship.png'
        image.onload=()=>{
            const scale=0.15
            this.image=image
            this.width=image.width*scale
            this.height=image.height*scale

            this.position={
                x:canvas.width/2 - this.width/2,
                y:canvas.height - this.height -20
            }
        }
    }
    draw(){
        c.save()
        c.globalAlpha=this.opacity
        if(this.image){
            c.drawImage(this.image,this.position.x,this.position.y,this.width,this.height)
        }
        c.restore()
    }
    update(){
        if(this.image){
            this.draw()
            this.position.x += this.velocity.x
        }
    }
}
// projectile class of the player
class Projectile{
    constructor({position,velocity}){
        this.position=position
        this.velocity=velocity
        this.radius=4
    }
    draw(){
        c.beginPath()
        c.arc(this.position.x,this.position.y,this.radius,0,Math.PI*2)
        c.fillStyle='red'
        c.fill()
        c.closePath()
    }
    update(){
        this.draw()
        this.position.x +=this.velocity.x
        this.position.y +=this.velocity.y
    }
}
// invader class
class Invader{
    constructor({position}){
        this.velocity= {
            x:0,
            y:0
        }
        const image=new Image()
        image.src='images/invader.png'
        image.onload=()=>{
            const scale=1
            this.image=image
            this.width=image.width*scale
            this.height=image.height*scale
            this.position={
                x:position.x,
                y:position.y
            }
        }
    }
    draw(){
        if(this.image){
            c.drawImage(this.image,this.position.x,this.position.y,this.width,this.height)
        }
    }
    update({velocity}){
        if(this.image){
            this.draw()
            this.position.x += velocity.x
            this.position.y += velocity.y
        }
    }
    shoot(InvaderProjectiles){
        InvaderProjectiles.push(new InvaderProjectile({
            position : {
                x: this.position.x + this.width/2,
                y: this.position.y + this.height
            },
            velocity :{
                x : 0,
                y : 5
            }
        }))
    }
}
// projectile class of the invader
class InvaderProjectile{
    constructor({position,velocity}){
        this.position=position
        this.velocity=velocity
        this.width=3
        this.height=10
    }
    draw(){
        c.fillStyle='white'
        c.fillRect(this.position.x,this.position.y,this.width,this.height)
    }
    update(){
        this.draw()
        this.position.x +=this.velocity.x
        this.position.y +=this.velocity.y
    }
}
// grid class
class Grid {
    constructor(){
        this.position = {
            x:0,
            y:0
        }
        this.velocity ={
            x : 2,
            y : 0
        }
        this.invaders = []
        const cols=Math.floor(Math.random()*10+5)
        const rows=Math.floor(Math.random()*5+2)
        this.width=cols * 30
        for(let i=0;i<cols;i++){
            for(let y=0;y<rows;y++){
                this.invaders.push(new Invader({position : {
                    x : i*30,
                    y : y*30
                }}))
            }
        }
    }
    update(){
        this.position.x+=this.velocity.x
        this.position.y+=this.velocity.y
        this.velocity.y=0
        if(this.position.x+this.width>=canvas.width || this.position.x<=0){
            this.velocity.x=-this.velocity.x
            this.velocity.y =30
        }
    }
}
const player=new Player()  // player object
const projectiles =[]      // projectile array of player
const grids = []           // grid array
const invaderProjectiles =[]  // projectile array of invader
const keys = {
    a:{
        pressed : false
    },
    d:{
        pressed : false
    },
    space:{
        pressed : false
    }
}
let randomInterval=Math.floor(Math.random() * 500)+500
let frames =0
let game ={
    over : false,
    active : true
}
let score =0

// animate function
function animate(){
    if (!game.active) {
        c.fillStyle = 'rgba(0, 0, 0, 0.7)';
        c.fillRect(0, 0, canvas.width, canvas.height);

        c.fillStyle = 'white';
        c.font = '40px Arial';
        c.textAlign = 'center';
        c.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 20);
        c.font = '30px Arial';
        c.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
        return;
    }
    requestAnimationFrame(animate)
    c.fillStyle='black'
    c.fillRect(0,0,canvas.width,canvas.height)
    player.update()
    // accessing all the projectiles of invader
    invaderProjectiles.forEach((invaderProjectile,index) =>{
        if(invaderProjectile.position.y+invaderProjectile.height>=canvas.height){
            setTimeout(()=>{
                invaderProjectiles.splice(index,1)
            },0)
        }else{
            invaderProjectile.update()
        }
        // checking if projectile of the invader hits the player or not 
        if (
            invaderProjectile.position.y + invaderProjectile.height >= player.position.y &&
            invaderProjectile.position.x + invaderProjectile.width >= player.position.x &&
            invaderProjectile.position.x <= player.position.x + player.width
        ) {
            setTimeout(() => {
                invaderProjectiles.splice(index, 1);
                player.opacity = 0;
                game.over = true;
            }, 0);
            console.log("You lose");
            setTimeout(() => {
                game.active = false;
            }, 1000);
        }
    })
    // accessing all the projectiles of the player
    projectiles.forEach((projectile,index) =>{
        if(projectile.position.y + projectile.radius<=0){
            setTimeout(()=>{
                projectiles.splice(index,1)
            },0)
        }else{
            projectile.update()
        }
    })
    // accessing all the invaders through the grid
    grids.forEach((grid,gridIndex) => {
        grid.update()
        if(frames%100===0 && grid.invaders.length >0){
            grid.invaders[Math.floor(Math.random() * grid.invaders.length)].shoot(invaderProjectiles)
        }
        grid.invaders.forEach((invader,i) =>{
            invader.update({velocity : grid.velocity})
            // checking if the projectile hits the invader or not
            projectiles.forEach((projectile,j) =>{
                if(projectile.position.y - projectile.radius <= invader.position.y+invader.height &&
                    projectile.position.x+projectile.radius >= invader.position.x &&
                    projectile.position.x-projectile.radius <= invader.position.x+invader.width &&
                    projectile.position.y +projectile.radius >= invader.position.y){
                    setTimeout(()=>{
                        const invaderFound = grid.invaders.find(invader2=>
                            invader2 === invader
                        )
                        const projectileFound = projectiles.find(projectile2 => projectile2===projectile)
                        if(invaderFound && projectileFound){
                            score += 10
                            scoreEl.innerHTML=score
                            grid.invaders.splice(i,1)
                            projectiles.splice(j,1)

                            if(grid.invaders.length > 0 ){
                                const firstInvader = grid.invaders[0]
                                const lastInvader = grid.invaders[grid.invaders.length -1]

                                grid.width = lastInvader.position.x - firstInvader.position.x + lastInvader.width

                                grid.position.x=firstInvader.position.x
                            }else{
                                grids.splice(gridIndex,1)
                            }
                        }
                    },0)
                }
            })
        })
    })
    // making the player move
    if(keys.a.pressed && player.position.x>=0){
        player.velocity.x=-5
    }else if(keys.d.pressed && player.position.x+player.width<=canvas.width){
        player.velocity.x=5
    }else{
        player.velocity.x=0
    }
    // spawning enemies
    if(frames % randomInterval ===0){
        grids.push(new Grid()) 
        randomInterval=Math.floor(Math.random() * 500)+500
        frames=0
    }
    frames++
}
animate()

addEventListener('keydown',({key})=>{
    if(game.over) return
    switch (key) {
        case 'a':
            keys.a.pressed=true
            break
        case 'd':
            keys.d.pressed=true
            break
        case 'ArrowLeft':
            keys.a.pressed=true
            break
        case 'ArrowRight':
            keys.d.pressed=true
            break
        case ' ':
            keys.space.pressed=true
            projectiles.push(
                new Projectile({
                    position : {
                       x : player.position.x + player.width/2,
                       y : player.position.y
                    },
                    velocity : {
                        x : 0,
                        y : -10
                    }
                })
            )
            break
    }
})

addEventListener('keyup',({key})=>{
    switch (key) {
        case 'a':
            keys.a.pressed=false
            break
        case 'd':
            keys.d.pressed=false
            break
        case ' ':
            keys.space.pressed=false
            break
        case 'ArrowLeft':
            keys.a.pressed=false
            break
        case 'ArrowRight':
            keys.d.pressed=false
            break
    }
})