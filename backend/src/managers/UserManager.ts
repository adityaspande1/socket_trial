import {Socket} from "socket.io";
import {RoomManager} from "./RoomManager";
export interface User{
    socket: Socket,
    name : string
}

export class UserManager{
    private users:User[];
    private queue:string[];
    private roomManager:RoomManager;

    constructor(){
        this.users=[];
        this.queue=[];
        this.roomManager=new RoomManager();

    }

    addUser(name: string, socket:Socket){
        this.users.push({
            name,socket
        })

        this.queue.push(socket.id);
        socket.emit("user-added");
        this.clearQueue();
        this.initHandlers(socket);

    }
    initHandlers(socket: Socket) {
        socket.on("offer", ({sdp, roomId}: {sdp: string, roomId: string}) => {
            this.roomManager.onOffer(roomId, sdp, socket.id);
        })

        socket.on("answer",({sdp, roomId}: {sdp: string, roomId: string}) => {
            this.roomManager.onAnswer(roomId, sdp, socket.id);
        })

        socket.on("add-ice-candidate", ({candidate, roomId, type}) => {
            this.roomManager.onIceCandidates(roomId, socket.id, candidate, type);
        });
    }

    removeUser(socket_id:string){
        const userIndex=this.users.findIndex(user=>user.socket.id===socket_id);
        this.users=this.users.filter(user=>user.socket.id!==socket_id);
        this.queue=this.queue.filter(user=>user!==socket_id);
    }

    clearQueue(){
        console.log("Queue length", this.queue.length);
        if(this.queue.length<2){
            return;
        }
        const id1=this.queue.pop();
        const id2=this.queue.pop();

        const user1=this.users.find(user=>user.socket.id===id1);
        const user2=this.users.find(user=>user.socket.id===id2);

        if(!user1 || !user2){
            return ;
        }

        console.log("Creating room");
        this.roomManager.createRoom(user1,user2);
        this.clearQueue();

    }
}