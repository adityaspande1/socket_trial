import {Socket} from "socket.io";
import http from "http";

import express from "express";
import {Server} from "socket.io";
import { UserManager } from "./managers/UserManager";

const app=express();

const server=http.createServer(app);

const io=new Server(server,{
    cors:{
        origin:"*",
    }
});
const userManager= new UserManager();
io.on("connection",(socket:Socket)=>{
    //something here.
    console.log("New connection ", socket.id);
    userManager.addUser("random",socket);
    socket.on("disconnect",()=>{
        console.log("User disconnected", socket.id);
        userManager.removeUser(socket.id);
    })
})


server.listen(3000,()=>{
    console.log("Server is running on port 3000");
})