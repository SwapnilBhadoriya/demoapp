import { Component, OnInit } from '@angular/core';
import { Socket, io } from 'socket.io-client';
@Component({
  selector: 'app-sc',
  templateUrl: './sc.component.html',
  styleUrls: ['./sc.component.css'],
})
export class ScComponent implements OnInit {
  constructor() {}
  io: any;
  ngOnInit(): void {
    this.io = io('http://localhost:4000');
  }

  emitMessage() {
    const d = {};
    this.io.emit('hello', d);
  }
}
