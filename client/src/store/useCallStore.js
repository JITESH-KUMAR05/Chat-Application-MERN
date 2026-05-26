// import { create } from "zustand";

// export const useCallStore = create((set) => ({

//   incomingCall: null,

//   callAccepted: false,

//   localStream: null,

//   remoteStream: null,

//   caller: null,

//   callType: null,

//   setIncomingCall: (call) =>
//     set({
//       incomingCall: call,
//       caller: call.from,
//       callType: call.callType,
//     }),

//   setCallAccepted: (value) =>
//     set({
//       callAccepted: value,
//     }),

//   setLocalStream: (stream) =>
//     set({
//       localStream: stream,
//     }),

//   setRemoteStream: (stream) =>
//     set({
//       remoteStream: stream,
//     }),

//   resetCall: () =>
//     set({
//       incomingCall: null,
//       callAccepted: false,
//       localStream: null,
//       remoteStream: null,
//       caller: null,
//       callType: null,
//     }),

// }));


import { create } from "zustand";

export const useCallStore = create((set) => ({

  incomingCall: null,

  outgoingCall: null,

  callAccepted: false,

  isCalling: false,

  localStream: null,

  activeCallUser: null,

  remoteStream: null,

  caller: null,

  callType: null,

  setIncomingCall: (call) =>
    set({
      incomingCall: call,
      caller: call.from,
      callType: call.callType,
    }),

  setOutgoingCall: (call) =>
    set({
      outgoingCall: call,
      isCalling: true,
    }),

  setCallAccepted: (value) =>
    set({
      callAccepted: value,
      isCalling: false,
    }),

  setLocalStream: (stream) =>
    set({
      localStream: stream,
    }),

setActiveCallUser: (user) =>
  set({
    activeCallUser: user,
  }),

  setRemoteStream: (stream) =>
    set({
      remoteStream: stream,
    }),

  resetCall: () =>
    set({
      incomingCall: null,
      outgoingCall: null,
      activeCallUser: null,
      callAccepted: false,
      isCalling: false,
      localStream: null,
      remoteStream: null,
      caller: null,
      callType: null,
    }),

}));