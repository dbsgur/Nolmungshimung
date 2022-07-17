// import { randomUUID } from 'crypto';
import React, { useState, useEffect, useRef } from 'react';
import Peer from 'simple-peer';
import styled from 'styled-components';
import socket from './voiceSocket';
import NewAudio from './NewAudio';

const Room = (props) => {
  const currentUser = sessionStorage.getItem('user_email');
  const [peers, setPeers] = useState([]);
  const [userVideoAudio, setUserVideoAudio] = useState({
    localUser: { video: true, audio: true },
  });
  const peersRef = useRef([]);
  const userAudioRef = useRef();
  const userStream = useRef();
  // const roomId = props.match.params.roomId;
  const roomId = props.projectId
  // const currentUser = u

  useEffect(() => {

    socket.emit('BE-check-user', { roomId: roomId, currentUser })
    socket.on('FE-error-user-exist', ({ error }) => {
      if (!error) {
        // const roomName = roomRef.current.value;
        // const userName = userRef.current.value;

        sessionStorage.setItem('user', currentUser);
        // props.history.push(`/room/${roomName}`);
      } else {
        console.log('User name already exist');
        // setErr(error);
        // setErrMsg('User name already exist');
      }
    });
    // Connect Camera & Mic
    navigator.mediaDevices
      .getUserMedia({ video: false, audio: true })
      .then((stream) => {
        userAudioRef.current.srcObject = stream;
        userStream.current = stream;
        socket.emit('BE-join-room', { roomId, userName: currentUser });

        socket.on('FE-user-join', (users) => {
          console.log(`FE-user-join ${users}`)

          // all users
          const peers = [];
          users.forEach(({ userId, info }) => {
            let { userName, audio } = info;

            if (userName !== currentUser) {
              const peer = createPeer(userId, socket.id, stream);

              peer.userName = userName;
              peer.peerID = userId;

              peersRef.current.push({
                peerID: userId,
                peer,
                userName,
              });
              peers.push(peer);

              setUserVideoAudio((preList) => {
                return {
                  ...preList,
                  [peer.userName]: { audio },
                };
              });
            }
          });

          setPeers(peers);
        });

        socket.on('FE-receive-call', ({ signal, from, info }) => {
          let { userName, audio } = info;
          const peerIdx = findPeer(from);

          if (!peerIdx) {
            const peer = addPeer(signal, from, stream);

            peer.userName = userName;

            peersRef.current.push({
              peerID: from,
              peer,
              userName: userName,
            });
            setPeers((users) => {
              return [...users, peer];
            });
            setUserVideoAudio((preList) => {
              return {
                ...preList,
                [peer.userName]: { audio },
              };
            });
          }
        });

        socket.on('FE-call-accepted', ({ signal, answerId }) => {
          const peerIdx = findPeer(answerId);
          peerIdx.peer.signal(signal);
        });

        socket.on('FE-user-leave', ({ userId, userName }) => {
          const peerIdx = findPeer(userId);
          peerIdx.peer.destroy();
          setPeers((users) => {
            users = users.filter((user) => user.peerID !== peerIdx.peer.peerID);
            return [...users];
          });
          peersRef.current = peersRef.current.filter(({ peerID }) => peerID !== userId );
        });
      });

    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line
  }, []);

  function createPeer(userId, caller, stream) {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on('signal', (signal) => {
      socket.emit('BE-call-user', {
        userToCall: userId,
        from: caller,
        signal,
      });
    });
    peer.on('disconnect', () => {
      peer.destroy();
    });

    return peer;
  }

  function addPeer(incomingSignal, callerId, stream) {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });

    peer.on('signal', (signal) => {
      socket.emit('BE-accept-call', { signal, to: callerId });
    });

    peer.on('disconnect', () => {
      peer.destroy();
    });

    peer.signal(incomingSignal);

    return peer;
  }

  function findPeer(id) {
    return peersRef.current.find((p) => p.peerID === id);
  }

  function createUserVideo(peer, index, arr) {
    return (
        <NewAudio key={index} peer={peer} number={arr.length} />
    );
  }

  return (
        <>
            <MyVideo
              ref={userAudioRef}
              // muted
            ></MyVideo>
          {peers &&
            peers.map((peer, index, arr) => createUserVideo(peer, index, arr))}
        </>        
  );
};

const MyVideo = styled.audio``;

export default Room;