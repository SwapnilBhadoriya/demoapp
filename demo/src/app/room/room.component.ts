import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

import Peer from 'peerjs';
import { Socket, io } from 'socket.io-client';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css'],
})
export class RoomComponent implements OnInit {
  message = '';
  otherPeerId = '';

  @ViewChild('videoGrid', { static: true })
  videoGrid!: ElementRef<HTMLButtonElement>;
  peer: any;
  socket = io('http:localhost:4000');
  myVideoStream?: MediaStream;
  sendMessage() {
    this.socket.emit('hello', this.message);
    this.message = '';
  }
  ngOnInit(): void {
    this.socket = io('http://localhost:5000');

    this.peer = new Peer('', {
      host: 'localhost',
      port: 5000,
      path: '/peerjs',
    });
    this.initializeMediaStream();
    this.peer.on('open', (p: any) => {
      console.log('Peer server connected .');

      console.log(p);
    });
    this.peer.on('call', (call: any) => {
      call.answer(this.myVideoStream);
      console.log(call.metadata.peer.id);
      call.on('stream', (stream: any) => {
        console.log('Others', stream);
      });
    });
    // Listen for userJoined event
    this.socket.on('user-joined', (userId: string) => {
      console.log(`${userId} joined the room.`);
      // Perform any necessary actions when a new user joins the room
    });
    this.socket.on('getMsgs', (message: string) => {
      console.log(message);
    });
  }
  joinRoom() {
    const roomId = 'r123';
    this.socket.emit('join-room', roomId, this.socket.id);
  }
  callPeer() {
    const call = this.peer.call(this.otherPeerId, this.myVideoStream, {
      id: this.peer.id,
    });
    call.on('stream', (stream: any) => {
      console.log(stream);
      this.addVideoStream(stream);
      // this.otherStream = stream;
      // this.otherVideoElement.srcObject = stream;
    });
  }
  async initializeMediaStream(): Promise<void> {
    try {
      this.myVideoStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      // this.addVideoStream(this.myVideoStream);
    } catch (error) {
      console.error('Error accessing media devices:', error);
    }
  }
  addVideoStream(stream: MediaStream): void {
    const myVideo = document.createElement('video');
    myVideo.srcObject = stream;
    myVideo.muted = true;
    myVideo.autoplay = true;
    this.videoGrid.nativeElement.append(myVideo);
  }
}
