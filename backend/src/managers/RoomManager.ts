import {User} from "./UserManager"

interface Room{
    user1:User,
    user2:User,
}

let Room_Id=1;

export class RoomManager{
    private rooms:Map<string, Room>
    

    constructor(){
        this.rooms= new Map<string, Room>();
    }

    createRoom(user1:User,user2:User){
        const roomId=this.generateRoomId().toString();
        this.rooms.set(roomId.toString(), {
            user1, 
            user2,
        })
        user1.socket.emit("room-created",{
            roomId
        });
        user2.socket.emit("room-created",{
            roomId
        });
    }

    onOffer(roomId:string,sdp:string,senderSocketid:string){
        const room =this.rooms.get(roomId);
        if(!room){
            return;
        }
        const receivingUser=room.user1.socket.id===senderSocketid?room.user2:room.user1;
        receivingUser.socket.emit("offer",{
                sdp,roomId});
    }

        onAnswer(roomId:string,sdp:string,senderSocketid:string){
            const room=this.rooms.get(roomId);
            if(!room){
                return;
            }
            const receivingUser=room.user1.socket.id===senderSocketid?room.user2:room.user1;

            receivingUser?.socket.emit("answer", {
                sdp,
                roomId
            });
    }

    onIceCandidates(roomId: string, senderSocketid: string, candidate: any, type: "sender" | "receiver") {
        const room = this.rooms.get(roomId);
        if (!room) {
            return;
        }
        const receivingUser = room.user1.socket.id === senderSocketid ? room.user2: room.user1;
        receivingUser.socket.emit("add-ice-candidate", ({candidate, type}));
    }

    

    generateRoomId(){
        return Room_Id++;
    }

}