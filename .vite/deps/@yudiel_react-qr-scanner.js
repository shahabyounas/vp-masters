import {
  __commonJS,
  __export,
  __toESM,
  require_react
} from "./chunk-3A6WRQ5K.js";

// node_modules/sdp/sdp.js
var require_sdp = __commonJS({
  "node_modules/sdp/sdp.js"(exports, module) {
    "use strict";
    var SDPUtils2 = {};
    SDPUtils2.generateIdentifier = function() {
      return Math.random().toString(36).substring(2, 12);
    };
    SDPUtils2.localCName = SDPUtils2.generateIdentifier();
    SDPUtils2.splitLines = function(blob) {
      return blob.trim().split("\n").map((line) => line.trim());
    };
    SDPUtils2.splitSections = function(blob) {
      const parts = blob.split("\nm=");
      return parts.map((part, index) => (index > 0 ? "m=" + part : part).trim() + "\r\n");
    };
    SDPUtils2.getDescription = function(blob) {
      const sections = SDPUtils2.splitSections(blob);
      return sections && sections[0];
    };
    SDPUtils2.getMediaSections = function(blob) {
      const sections = SDPUtils2.splitSections(blob);
      sections.shift();
      return sections;
    };
    SDPUtils2.matchPrefix = function(blob, prefix) {
      return SDPUtils2.splitLines(blob).filter((line) => line.indexOf(prefix) === 0);
    };
    SDPUtils2.parseCandidate = function(line) {
      let parts;
      if (line.indexOf("a=candidate:") === 0) {
        parts = line.substring(12).split(" ");
      } else {
        parts = line.substring(10).split(" ");
      }
      const candidate = {
        foundation: parts[0],
        component: { 1: "rtp", 2: "rtcp" }[parts[1]] || parts[1],
        protocol: parts[2].toLowerCase(),
        priority: parseInt(parts[3], 10),
        ip: parts[4],
        address: parts[4],
        // address is an alias for ip.
        port: parseInt(parts[5], 10),
        // skip parts[6] == 'typ'
        type: parts[7]
      };
      for (let i2 = 8; i2 < parts.length; i2 += 2) {
        switch (parts[i2]) {
          case "raddr":
            candidate.relatedAddress = parts[i2 + 1];
            break;
          case "rport":
            candidate.relatedPort = parseInt(parts[i2 + 1], 10);
            break;
          case "tcptype":
            candidate.tcpType = parts[i2 + 1];
            break;
          case "ufrag":
            candidate.ufrag = parts[i2 + 1];
            candidate.usernameFragment = parts[i2 + 1];
            break;
          default:
            if (candidate[parts[i2]] === void 0) {
              candidate[parts[i2]] = parts[i2 + 1];
            }
            break;
        }
      }
      return candidate;
    };
    SDPUtils2.writeCandidate = function(candidate) {
      const sdp2 = [];
      sdp2.push(candidate.foundation);
      const component = candidate.component;
      if (component === "rtp") {
        sdp2.push(1);
      } else if (component === "rtcp") {
        sdp2.push(2);
      } else {
        sdp2.push(component);
      }
      sdp2.push(candidate.protocol.toUpperCase());
      sdp2.push(candidate.priority);
      sdp2.push(candidate.address || candidate.ip);
      sdp2.push(candidate.port);
      const type = candidate.type;
      sdp2.push("typ");
      sdp2.push(type);
      if (type !== "host" && candidate.relatedAddress && candidate.relatedPort) {
        sdp2.push("raddr");
        sdp2.push(candidate.relatedAddress);
        sdp2.push("rport");
        sdp2.push(candidate.relatedPort);
      }
      if (candidate.tcpType && candidate.protocol.toLowerCase() === "tcp") {
        sdp2.push("tcptype");
        sdp2.push(candidate.tcpType);
      }
      if (candidate.usernameFragment || candidate.ufrag) {
        sdp2.push("ufrag");
        sdp2.push(candidate.usernameFragment || candidate.ufrag);
      }
      return "candidate:" + sdp2.join(" ");
    };
    SDPUtils2.parseIceOptions = function(line) {
      return line.substring(14).split(" ");
    };
    SDPUtils2.parseRtpMap = function(line) {
      let parts = line.substring(9).split(" ");
      const parsed = {
        payloadType: parseInt(parts.shift(), 10)
        // was: id
      };
      parts = parts[0].split("/");
      parsed.name = parts[0];
      parsed.clockRate = parseInt(parts[1], 10);
      parsed.channels = parts.length === 3 ? parseInt(parts[2], 10) : 1;
      parsed.numChannels = parsed.channels;
      return parsed;
    };
    SDPUtils2.writeRtpMap = function(codec) {
      let pt2 = codec.payloadType;
      if (codec.preferredPayloadType !== void 0) {
        pt2 = codec.preferredPayloadType;
      }
      const channels = codec.channels || codec.numChannels || 1;
      return "a=rtpmap:" + pt2 + " " + codec.name + "/" + codec.clockRate + (channels !== 1 ? "/" + channels : "") + "\r\n";
    };
    SDPUtils2.parseExtmap = function(line) {
      const parts = line.substring(9).split(" ");
      return {
        id: parseInt(parts[0], 10),
        direction: parts[0].indexOf("/") > 0 ? parts[0].split("/")[1] : "sendrecv",
        uri: parts[1],
        attributes: parts.slice(2).join(" ")
      };
    };
    SDPUtils2.writeExtmap = function(headerExtension) {
      return "a=extmap:" + (headerExtension.id || headerExtension.preferredId) + (headerExtension.direction && headerExtension.direction !== "sendrecv" ? "/" + headerExtension.direction : "") + " " + headerExtension.uri + (headerExtension.attributes ? " " + headerExtension.attributes : "") + "\r\n";
    };
    SDPUtils2.parseFmtp = function(line) {
      const parsed = {};
      let kv;
      const parts = line.substring(line.indexOf(" ") + 1).split(";");
      for (let j = 0; j < parts.length; j++) {
        kv = parts[j].trim().split("=");
        parsed[kv[0].trim()] = kv[1];
      }
      return parsed;
    };
    SDPUtils2.writeFmtp = function(codec) {
      let line = "";
      let pt2 = codec.payloadType;
      if (codec.preferredPayloadType !== void 0) {
        pt2 = codec.preferredPayloadType;
      }
      if (codec.parameters && Object.keys(codec.parameters).length) {
        const params = [];
        Object.keys(codec.parameters).forEach((param) => {
          if (codec.parameters[param] !== void 0) {
            params.push(param + "=" + codec.parameters[param]);
          } else {
            params.push(param);
          }
        });
        line += "a=fmtp:" + pt2 + " " + params.join(";") + "\r\n";
      }
      return line;
    };
    SDPUtils2.parseRtcpFb = function(line) {
      const parts = line.substring(line.indexOf(" ") + 1).split(" ");
      return {
        type: parts.shift(),
        parameter: parts.join(" ")
      };
    };
    SDPUtils2.writeRtcpFb = function(codec) {
      let lines = "";
      let pt2 = codec.payloadType;
      if (codec.preferredPayloadType !== void 0) {
        pt2 = codec.preferredPayloadType;
      }
      if (codec.rtcpFeedback && codec.rtcpFeedback.length) {
        codec.rtcpFeedback.forEach((fb) => {
          lines += "a=rtcp-fb:" + pt2 + " " + fb.type + (fb.parameter && fb.parameter.length ? " " + fb.parameter : "") + "\r\n";
        });
      }
      return lines;
    };
    SDPUtils2.parseSsrcMedia = function(line) {
      const sp = line.indexOf(" ");
      const parts = {
        ssrc: parseInt(line.substring(7, sp), 10)
      };
      const colon = line.indexOf(":", sp);
      if (colon > -1) {
        parts.attribute = line.substring(sp + 1, colon);
        parts.value = line.substring(colon + 1);
      } else {
        parts.attribute = line.substring(sp + 1);
      }
      return parts;
    };
    SDPUtils2.parseSsrcGroup = function(line) {
      const parts = line.substring(13).split(" ");
      return {
        semantics: parts.shift(),
        ssrcs: parts.map((ssrc) => parseInt(ssrc, 10))
      };
    };
    SDPUtils2.getMid = function(mediaSection) {
      const mid = SDPUtils2.matchPrefix(mediaSection, "a=mid:")[0];
      if (mid) {
        return mid.substring(6);
      }
    };
    SDPUtils2.parseFingerprint = function(line) {
      const parts = line.substring(14).split(" ");
      return {
        algorithm: parts[0].toLowerCase(),
        // algorithm is case-sensitive in Edge.
        value: parts[1].toUpperCase()
        // the definition is upper-case in RFC 4572.
      };
    };
    SDPUtils2.getDtlsParameters = function(mediaSection, sessionpart) {
      const lines = SDPUtils2.matchPrefix(
        mediaSection + sessionpart,
        "a=fingerprint:"
      );
      return {
        role: "auto",
        fingerprints: lines.map(SDPUtils2.parseFingerprint)
      };
    };
    SDPUtils2.writeDtlsParameters = function(params, setupType) {
      let sdp2 = "a=setup:" + setupType + "\r\n";
      params.fingerprints.forEach((fp) => {
        sdp2 += "a=fingerprint:" + fp.algorithm + " " + fp.value + "\r\n";
      });
      return sdp2;
    };
    SDPUtils2.parseCryptoLine = function(line) {
      const parts = line.substring(9).split(" ");
      return {
        tag: parseInt(parts[0], 10),
        cryptoSuite: parts[1],
        keyParams: parts[2],
        sessionParams: parts.slice(3)
      };
    };
    SDPUtils2.writeCryptoLine = function(parameters) {
      return "a=crypto:" + parameters.tag + " " + parameters.cryptoSuite + " " + (typeof parameters.keyParams === "object" ? SDPUtils2.writeCryptoKeyParams(parameters.keyParams) : parameters.keyParams) + (parameters.sessionParams ? " " + parameters.sessionParams.join(" ") : "") + "\r\n";
    };
    SDPUtils2.parseCryptoKeyParams = function(keyParams) {
      if (keyParams.indexOf("inline:") !== 0) {
        return null;
      }
      const parts = keyParams.substring(7).split("|");
      return {
        keyMethod: "inline",
        keySalt: parts[0],
        lifeTime: parts[1],
        mkiValue: parts[2] ? parts[2].split(":")[0] : void 0,
        mkiLength: parts[2] ? parts[2].split(":")[1] : void 0
      };
    };
    SDPUtils2.writeCryptoKeyParams = function(keyParams) {
      return keyParams.keyMethod + ":" + keyParams.keySalt + (keyParams.lifeTime ? "|" + keyParams.lifeTime : "") + (keyParams.mkiValue && keyParams.mkiLength ? "|" + keyParams.mkiValue + ":" + keyParams.mkiLength : "");
    };
    SDPUtils2.getCryptoParameters = function(mediaSection, sessionpart) {
      const lines = SDPUtils2.matchPrefix(
        mediaSection + sessionpart,
        "a=crypto:"
      );
      return lines.map(SDPUtils2.parseCryptoLine);
    };
    SDPUtils2.getIceParameters = function(mediaSection, sessionpart) {
      const ufrag = SDPUtils2.matchPrefix(
        mediaSection + sessionpart,
        "a=ice-ufrag:"
      )[0];
      const pwd = SDPUtils2.matchPrefix(
        mediaSection + sessionpart,
        "a=ice-pwd:"
      )[0];
      if (!(ufrag && pwd)) {
        return null;
      }
      return {
        usernameFragment: ufrag.substring(12),
        password: pwd.substring(10)
      };
    };
    SDPUtils2.writeIceParameters = function(params) {
      let sdp2 = "a=ice-ufrag:" + params.usernameFragment + "\r\na=ice-pwd:" + params.password + "\r\n";
      if (params.iceLite) {
        sdp2 += "a=ice-lite\r\n";
      }
      return sdp2;
    };
    SDPUtils2.parseRtpParameters = function(mediaSection) {
      const description = {
        codecs: [],
        headerExtensions: [],
        fecMechanisms: [],
        rtcp: []
      };
      const lines = SDPUtils2.splitLines(mediaSection);
      const mline = lines[0].split(" ");
      description.profile = mline[2];
      for (let i2 = 3; i2 < mline.length; i2++) {
        const pt2 = mline[i2];
        const rtpmapline = SDPUtils2.matchPrefix(
          mediaSection,
          "a=rtpmap:" + pt2 + " "
        )[0];
        if (rtpmapline) {
          const codec = SDPUtils2.parseRtpMap(rtpmapline);
          const fmtps = SDPUtils2.matchPrefix(
            mediaSection,
            "a=fmtp:" + pt2 + " "
          );
          codec.parameters = fmtps.length ? SDPUtils2.parseFmtp(fmtps[0]) : {};
          codec.rtcpFeedback = SDPUtils2.matchPrefix(
            mediaSection,
            "a=rtcp-fb:" + pt2 + " "
          ).map(SDPUtils2.parseRtcpFb);
          description.codecs.push(codec);
          switch (codec.name.toUpperCase()) {
            case "RED":
            case "ULPFEC":
              description.fecMechanisms.push(codec.name.toUpperCase());
              break;
            default:
              break;
          }
        }
      }
      SDPUtils2.matchPrefix(mediaSection, "a=extmap:").forEach((line) => {
        description.headerExtensions.push(SDPUtils2.parseExtmap(line));
      });
      const wildcardRtcpFb = SDPUtils2.matchPrefix(mediaSection, "a=rtcp-fb:* ").map(SDPUtils2.parseRtcpFb);
      description.codecs.forEach((codec) => {
        wildcardRtcpFb.forEach((fb) => {
          const duplicate = codec.rtcpFeedback.find((existingFeedback) => {
            return existingFeedback.type === fb.type && existingFeedback.parameter === fb.parameter;
          });
          if (!duplicate) {
            codec.rtcpFeedback.push(fb);
          }
        });
      });
      return description;
    };
    SDPUtils2.writeRtpDescription = function(kind, caps) {
      let sdp2 = "";
      sdp2 += "m=" + kind + " ";
      sdp2 += caps.codecs.length > 0 ? "9" : "0";
      sdp2 += " " + (caps.profile || "UDP/TLS/RTP/SAVPF") + " ";
      sdp2 += caps.codecs.map((codec) => {
        if (codec.preferredPayloadType !== void 0) {
          return codec.preferredPayloadType;
        }
        return codec.payloadType;
      }).join(" ") + "\r\n";
      sdp2 += "c=IN IP4 0.0.0.0\r\n";
      sdp2 += "a=rtcp:9 IN IP4 0.0.0.0\r\n";
      caps.codecs.forEach((codec) => {
        sdp2 += SDPUtils2.writeRtpMap(codec);
        sdp2 += SDPUtils2.writeFmtp(codec);
        sdp2 += SDPUtils2.writeRtcpFb(codec);
      });
      let maxptime = 0;
      caps.codecs.forEach((codec) => {
        if (codec.maxptime > maxptime) {
          maxptime = codec.maxptime;
        }
      });
      if (maxptime > 0) {
        sdp2 += "a=maxptime:" + maxptime + "\r\n";
      }
      if (caps.headerExtensions) {
        caps.headerExtensions.forEach((extension) => {
          sdp2 += SDPUtils2.writeExtmap(extension);
        });
      }
      return sdp2;
    };
    SDPUtils2.parseRtpEncodingParameters = function(mediaSection) {
      const encodingParameters = [];
      const description = SDPUtils2.parseRtpParameters(mediaSection);
      const hasRed = description.fecMechanisms.indexOf("RED") !== -1;
      const hasUlpfec = description.fecMechanisms.indexOf("ULPFEC") !== -1;
      const ssrcs = SDPUtils2.matchPrefix(mediaSection, "a=ssrc:").map((line) => SDPUtils2.parseSsrcMedia(line)).filter((parts) => parts.attribute === "cname");
      const primarySsrc = ssrcs.length > 0 && ssrcs[0].ssrc;
      let secondarySsrc;
      const flows = SDPUtils2.matchPrefix(mediaSection, "a=ssrc-group:FID").map((line) => {
        const parts = line.substring(17).split(" ");
        return parts.map((part) => parseInt(part, 10));
      });
      if (flows.length > 0 && flows[0].length > 1 && flows[0][0] === primarySsrc) {
        secondarySsrc = flows[0][1];
      }
      description.codecs.forEach((codec) => {
        if (codec.name.toUpperCase() === "RTX" && codec.parameters.apt) {
          let encParam = {
            ssrc: primarySsrc,
            codecPayloadType: parseInt(codec.parameters.apt, 10)
          };
          if (primarySsrc && secondarySsrc) {
            encParam.rtx = { ssrc: secondarySsrc };
          }
          encodingParameters.push(encParam);
          if (hasRed) {
            encParam = JSON.parse(JSON.stringify(encParam));
            encParam.fec = {
              ssrc: primarySsrc,
              mechanism: hasUlpfec ? "red+ulpfec" : "red"
            };
            encodingParameters.push(encParam);
          }
        }
      });
      if (encodingParameters.length === 0 && primarySsrc) {
        encodingParameters.push({
          ssrc: primarySsrc
        });
      }
      let bandwidth = SDPUtils2.matchPrefix(mediaSection, "b=");
      if (bandwidth.length) {
        if (bandwidth[0].indexOf("b=TIAS:") === 0) {
          bandwidth = parseInt(bandwidth[0].substring(7), 10);
        } else if (bandwidth[0].indexOf("b=AS:") === 0) {
          bandwidth = parseInt(bandwidth[0].substring(5), 10) * 1e3 * 0.95 - 50 * 40 * 8;
        } else {
          bandwidth = void 0;
        }
        encodingParameters.forEach((params) => {
          params.maxBitrate = bandwidth;
        });
      }
      return encodingParameters;
    };
    SDPUtils2.parseRtcpParameters = function(mediaSection) {
      const rtcpParameters = {};
      const remoteSsrc = SDPUtils2.matchPrefix(mediaSection, "a=ssrc:").map((line) => SDPUtils2.parseSsrcMedia(line)).filter((obj) => obj.attribute === "cname")[0];
      if (remoteSsrc) {
        rtcpParameters.cname = remoteSsrc.value;
        rtcpParameters.ssrc = remoteSsrc.ssrc;
      }
      const rsize = SDPUtils2.matchPrefix(mediaSection, "a=rtcp-rsize");
      rtcpParameters.reducedSize = rsize.length > 0;
      rtcpParameters.compound = rsize.length === 0;
      const mux = SDPUtils2.matchPrefix(mediaSection, "a=rtcp-mux");
      rtcpParameters.mux = mux.length > 0;
      return rtcpParameters;
    };
    SDPUtils2.writeRtcpParameters = function(rtcpParameters) {
      let sdp2 = "";
      if (rtcpParameters.reducedSize) {
        sdp2 += "a=rtcp-rsize\r\n";
      }
      if (rtcpParameters.mux) {
        sdp2 += "a=rtcp-mux\r\n";
      }
      if (rtcpParameters.ssrc !== void 0 && rtcpParameters.cname) {
        sdp2 += "a=ssrc:" + rtcpParameters.ssrc + " cname:" + rtcpParameters.cname + "\r\n";
      }
      return sdp2;
    };
    SDPUtils2.parseMsid = function(mediaSection) {
      let parts;
      const spec = SDPUtils2.matchPrefix(mediaSection, "a=msid:");
      if (spec.length === 1) {
        parts = spec[0].substring(7).split(" ");
        return { stream: parts[0], track: parts[1] };
      }
      const planB = SDPUtils2.matchPrefix(mediaSection, "a=ssrc:").map((line) => SDPUtils2.parseSsrcMedia(line)).filter((msidParts) => msidParts.attribute === "msid");
      if (planB.length > 0) {
        parts = planB[0].value.split(" ");
        return { stream: parts[0], track: parts[1] };
      }
    };
    SDPUtils2.parseSctpDescription = function(mediaSection) {
      const mline = SDPUtils2.parseMLine(mediaSection);
      const maxSizeLine = SDPUtils2.matchPrefix(mediaSection, "a=max-message-size:");
      let maxMessageSize;
      if (maxSizeLine.length > 0) {
        maxMessageSize = parseInt(maxSizeLine[0].substring(19), 10);
      }
      if (isNaN(maxMessageSize)) {
        maxMessageSize = 65536;
      }
      const sctpPort = SDPUtils2.matchPrefix(mediaSection, "a=sctp-port:");
      if (sctpPort.length > 0) {
        return {
          port: parseInt(sctpPort[0].substring(12), 10),
          protocol: mline.fmt,
          maxMessageSize
        };
      }
      const sctpMapLines = SDPUtils2.matchPrefix(mediaSection, "a=sctpmap:");
      if (sctpMapLines.length > 0) {
        const parts = sctpMapLines[0].substring(10).split(" ");
        return {
          port: parseInt(parts[0], 10),
          protocol: parts[1],
          maxMessageSize
        };
      }
    };
    SDPUtils2.writeSctpDescription = function(media, sctp) {
      let output = [];
      if (media.protocol !== "DTLS/SCTP") {
        output = [
          "m=" + media.kind + " 9 " + media.protocol + " " + sctp.protocol + "\r\n",
          "c=IN IP4 0.0.0.0\r\n",
          "a=sctp-port:" + sctp.port + "\r\n"
        ];
      } else {
        output = [
          "m=" + media.kind + " 9 " + media.protocol + " " + sctp.port + "\r\n",
          "c=IN IP4 0.0.0.0\r\n",
          "a=sctpmap:" + sctp.port + " " + sctp.protocol + " 65535\r\n"
        ];
      }
      if (sctp.maxMessageSize !== void 0) {
        output.push("a=max-message-size:" + sctp.maxMessageSize + "\r\n");
      }
      return output.join("");
    };
    SDPUtils2.generateSessionId = function() {
      return Math.random().toString().substr(2, 22);
    };
    SDPUtils2.writeSessionBoilerplate = function(sessId, sessVer, sessUser) {
      let sessionId;
      const version = sessVer !== void 0 ? sessVer : 2;
      if (sessId) {
        sessionId = sessId;
      } else {
        sessionId = SDPUtils2.generateSessionId();
      }
      const user = sessUser || "thisisadapterortc";
      return "v=0\r\no=" + user + " " + sessionId + " " + version + " IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\n";
    };
    SDPUtils2.getDirection = function(mediaSection, sessionpart) {
      const lines = SDPUtils2.splitLines(mediaSection);
      for (let i2 = 0; i2 < lines.length; i2++) {
        switch (lines[i2]) {
          case "a=sendrecv":
          case "a=sendonly":
          case "a=recvonly":
          case "a=inactive":
            return lines[i2].substring(2);
          default:
        }
      }
      if (sessionpart) {
        return SDPUtils2.getDirection(sessionpart);
      }
      return "sendrecv";
    };
    SDPUtils2.getKind = function(mediaSection) {
      const lines = SDPUtils2.splitLines(mediaSection);
      const mline = lines[0].split(" ");
      return mline[0].substring(2);
    };
    SDPUtils2.isRejected = function(mediaSection) {
      return mediaSection.split(" ", 2)[1] === "0";
    };
    SDPUtils2.parseMLine = function(mediaSection) {
      const lines = SDPUtils2.splitLines(mediaSection);
      const parts = lines[0].substring(2).split(" ");
      return {
        kind: parts[0],
        port: parseInt(parts[1], 10),
        protocol: parts[2],
        fmt: parts.slice(3).join(" ")
      };
    };
    SDPUtils2.parseOLine = function(mediaSection) {
      const line = SDPUtils2.matchPrefix(mediaSection, "o=")[0];
      const parts = line.substring(2).split(" ");
      return {
        username: parts[0],
        sessionId: parts[1],
        sessionVersion: parseInt(parts[2], 10),
        netType: parts[3],
        addressType: parts[4],
        address: parts[5]
      };
    };
    SDPUtils2.isValidSDP = function(blob) {
      if (typeof blob !== "string" || blob.length === 0) {
        return false;
      }
      const lines = SDPUtils2.splitLines(blob);
      for (let i2 = 0; i2 < lines.length; i2++) {
        if (lines[i2].length < 2 || lines[i2].charAt(1) !== "=") {
          return false;
        }
      }
      return true;
    };
    if (typeof module === "object") {
      module.exports = SDPUtils2;
    }
  }
});

// node_modules/@yudiel/react-qr-scanner/dist/index.esm.mjs
var import_react = __toESM(require_react(), 1);

// node_modules/webrtc-adapter/src/js/utils.js
var logDisabled_ = true;
var deprecationWarnings_ = true;
function extractVersion(uastring, expr, pos) {
  const match = uastring.match(expr);
  return match && match.length >= pos && parseFloat(match[pos], 10);
}
function wrapPeerConnectionEvent(window2, eventNameToWrap, wrapper) {
  if (!window2.RTCPeerConnection) {
    return;
  }
  const proto = window2.RTCPeerConnection.prototype;
  const nativeAddEventListener = proto.addEventListener;
  proto.addEventListener = function(nativeEventName, cb) {
    if (nativeEventName !== eventNameToWrap) {
      return nativeAddEventListener.apply(this, arguments);
    }
    const wrappedCallback = (e3) => {
      const modifiedEvent = wrapper(e3);
      if (modifiedEvent) {
        if (cb.handleEvent) {
          cb.handleEvent(modifiedEvent);
        } else {
          cb(modifiedEvent);
        }
      }
    };
    this._eventMap = this._eventMap || {};
    if (!this._eventMap[eventNameToWrap]) {
      this._eventMap[eventNameToWrap] = /* @__PURE__ */ new Map();
    }
    this._eventMap[eventNameToWrap].set(cb, wrappedCallback);
    return nativeAddEventListener.apply(this, [
      nativeEventName,
      wrappedCallback
    ]);
  };
  const nativeRemoveEventListener = proto.removeEventListener;
  proto.removeEventListener = function(nativeEventName, cb) {
    if (nativeEventName !== eventNameToWrap || !this._eventMap || !this._eventMap[eventNameToWrap]) {
      return nativeRemoveEventListener.apply(this, arguments);
    }
    if (!this._eventMap[eventNameToWrap].has(cb)) {
      return nativeRemoveEventListener.apply(this, arguments);
    }
    const unwrappedCb = this._eventMap[eventNameToWrap].get(cb);
    this._eventMap[eventNameToWrap].delete(cb);
    if (this._eventMap[eventNameToWrap].size === 0) {
      delete this._eventMap[eventNameToWrap];
    }
    if (Object.keys(this._eventMap).length === 0) {
      delete this._eventMap;
    }
    return nativeRemoveEventListener.apply(this, [
      nativeEventName,
      unwrappedCb
    ]);
  };
  Object.defineProperty(proto, "on" + eventNameToWrap, {
    get() {
      return this["_on" + eventNameToWrap];
    },
    set(cb) {
      if (this["_on" + eventNameToWrap]) {
        this.removeEventListener(
          eventNameToWrap,
          this["_on" + eventNameToWrap]
        );
        delete this["_on" + eventNameToWrap];
      }
      if (cb) {
        this.addEventListener(
          eventNameToWrap,
          this["_on" + eventNameToWrap] = cb
        );
      }
    },
    enumerable: true,
    configurable: true
  });
}
function disableLog(bool) {
  if (typeof bool !== "boolean") {
    return new Error("Argument type: " + typeof bool + ". Please use a boolean.");
  }
  logDisabled_ = bool;
  return bool ? "adapter.js logging disabled" : "adapter.js logging enabled";
}
function disableWarnings(bool) {
  if (typeof bool !== "boolean") {
    return new Error("Argument type: " + typeof bool + ". Please use a boolean.");
  }
  deprecationWarnings_ = !bool;
  return "adapter.js deprecation warnings " + (bool ? "disabled" : "enabled");
}
function log() {
  if (typeof window === "object") {
    if (logDisabled_) {
      return;
    }
    if (typeof console !== "undefined" && typeof console.log === "function") {
      console.log.apply(console, arguments);
    }
  }
}
function deprecated(oldMethod, newMethod) {
  if (!deprecationWarnings_) {
    return;
  }
  console.warn(oldMethod + " is deprecated, please use " + newMethod + " instead.");
}
function detectBrowser(window2) {
  const result = { browser: null, version: null };
  if (typeof window2 === "undefined" || !window2.navigator || !window2.navigator.userAgent) {
    result.browser = "Not a browser.";
    return result;
  }
  const { navigator: navigator2 } = window2;
  if (navigator2.userAgentData && navigator2.userAgentData.brands) {
    const chromium = navigator2.userAgentData.brands.find((brand) => {
      return brand.brand === "Chromium";
    });
    if (chromium) {
      return { browser: "chrome", version: parseInt(chromium.version, 10) };
    }
  }
  if (navigator2.mozGetUserMedia) {
    result.browser = "firefox";
    result.version = parseInt(extractVersion(
      navigator2.userAgent,
      /Firefox\/(\d+)\./,
      1
    ));
  } else if (navigator2.webkitGetUserMedia || window2.isSecureContext === false && window2.webkitRTCPeerConnection) {
    result.browser = "chrome";
    result.version = parseInt(extractVersion(
      navigator2.userAgent,
      /Chrom(e|ium)\/(\d+)\./,
      2
    ));
  } else if (window2.RTCPeerConnection && navigator2.userAgent.match(/AppleWebKit\/(\d+)\./)) {
    result.browser = "safari";
    result.version = parseInt(extractVersion(
      navigator2.userAgent,
      /AppleWebKit\/(\d+)\./,
      1
    ));
    result.supportsUnifiedPlan = window2.RTCRtpTransceiver && "currentDirection" in window2.RTCRtpTransceiver.prototype;
    result._safariVersion = extractVersion(
      navigator2.userAgent,
      /Version\/(\d+(\.?\d+))/,
      1
    );
  } else {
    result.browser = "Not a supported browser.";
    return result;
  }
  return result;
}
function isObject(val) {
  return Object.prototype.toString.call(val) === "[object Object]";
}
function compactObject(data) {
  if (!isObject(data)) {
    return data;
  }
  return Object.keys(data).reduce(function(accumulator, key) {
    const isObj = isObject(data[key]);
    const value = isObj ? compactObject(data[key]) : data[key];
    const isEmptyObject = isObj && !Object.keys(value).length;
    if (value === void 0 || isEmptyObject) {
      return accumulator;
    }
    return Object.assign(accumulator, { [key]: value });
  }, {});
}
function walkStats(stats, base, resultSet) {
  if (!base || resultSet.has(base.id)) {
    return;
  }
  resultSet.set(base.id, base);
  Object.keys(base).forEach((name) => {
    if (name.endsWith("Id")) {
      walkStats(stats, stats.get(base[name]), resultSet);
    } else if (name.endsWith("Ids")) {
      base[name].forEach((id) => {
        walkStats(stats, stats.get(id), resultSet);
      });
    }
  });
}
function filterStats(result, track, outbound) {
  const streamStatsType = outbound ? "outbound-rtp" : "inbound-rtp";
  const filteredResult = /* @__PURE__ */ new Map();
  if (track === null) {
    return filteredResult;
  }
  const trackStats = [];
  result.forEach((value) => {
    if (value.type === "track" && value.trackIdentifier === track.id) {
      trackStats.push(value);
    }
  });
  trackStats.forEach((trackStat) => {
    result.forEach((stats) => {
      if (stats.type === streamStatsType && stats.trackId === trackStat.id) {
        walkStats(result, stats, filteredResult);
      }
    });
  });
  return filteredResult;
}

// node_modules/webrtc-adapter/src/js/chrome/chrome_shim.js
var chrome_shim_exports = {};
__export(chrome_shim_exports, {
  fixNegotiationNeeded: () => fixNegotiationNeeded,
  shimAddTrackRemoveTrack: () => shimAddTrackRemoveTrack,
  shimAddTrackRemoveTrackWithNative: () => shimAddTrackRemoveTrackWithNative,
  shimGetSendersWithDtmf: () => shimGetSendersWithDtmf,
  shimGetUserMedia: () => shimGetUserMedia,
  shimMediaStream: () => shimMediaStream,
  shimOnTrack: () => shimOnTrack,
  shimPeerConnection: () => shimPeerConnection,
  shimSenderReceiverGetStats: () => shimSenderReceiverGetStats
});

// node_modules/webrtc-adapter/src/js/chrome/getusermedia.js
var logging = log;
function shimGetUserMedia(window2, browserDetails) {
  const navigator2 = window2 && window2.navigator;
  if (!navigator2.mediaDevices) {
    return;
  }
  const constraintsToChrome_ = function(c2) {
    if (typeof c2 !== "object" || c2.mandatory || c2.optional) {
      return c2;
    }
    const cc = {};
    Object.keys(c2).forEach((key) => {
      if (key === "require" || key === "advanced" || key === "mediaSource") {
        return;
      }
      const r2 = typeof c2[key] === "object" ? c2[key] : { ideal: c2[key] };
      if (r2.exact !== void 0 && typeof r2.exact === "number") {
        r2.min = r2.max = r2.exact;
      }
      const oldname_ = function(prefix, name) {
        if (prefix) {
          return prefix + name.charAt(0).toUpperCase() + name.slice(1);
        }
        return name === "deviceId" ? "sourceId" : name;
      };
      if (r2.ideal !== void 0) {
        cc.optional = cc.optional || [];
        let oc = {};
        if (typeof r2.ideal === "number") {
          oc[oldname_("min", key)] = r2.ideal;
          cc.optional.push(oc);
          oc = {};
          oc[oldname_("max", key)] = r2.ideal;
          cc.optional.push(oc);
        } else {
          oc[oldname_("", key)] = r2.ideal;
          cc.optional.push(oc);
        }
      }
      if (r2.exact !== void 0 && typeof r2.exact !== "number") {
        cc.mandatory = cc.mandatory || {};
        cc.mandatory[oldname_("", key)] = r2.exact;
      } else {
        ["min", "max"].forEach((mix) => {
          if (r2[mix] !== void 0) {
            cc.mandatory = cc.mandatory || {};
            cc.mandatory[oldname_(mix, key)] = r2[mix];
          }
        });
      }
    });
    if (c2.advanced) {
      cc.optional = (cc.optional || []).concat(c2.advanced);
    }
    return cc;
  };
  const shimConstraints_ = function(constraints, func) {
    if (browserDetails.version >= 61) {
      return func(constraints);
    }
    constraints = JSON.parse(JSON.stringify(constraints));
    if (constraints && typeof constraints.audio === "object") {
      const remap = function(obj, a2, b) {
        if (a2 in obj && !(b in obj)) {
          obj[b] = obj[a2];
          delete obj[a2];
        }
      };
      constraints = JSON.parse(JSON.stringify(constraints));
      remap(constraints.audio, "autoGainControl", "googAutoGainControl");
      remap(constraints.audio, "noiseSuppression", "googNoiseSuppression");
      constraints.audio = constraintsToChrome_(constraints.audio);
    }
    if (constraints && typeof constraints.video === "object") {
      let face = constraints.video.facingMode;
      face = face && (typeof face === "object" ? face : { ideal: face });
      const getSupportedFacingModeLies = browserDetails.version < 66;
      if (face && (face.exact === "user" || face.exact === "environment" || face.ideal === "user" || face.ideal === "environment") && !(navigator2.mediaDevices.getSupportedConstraints && navigator2.mediaDevices.getSupportedConstraints().facingMode && !getSupportedFacingModeLies)) {
        delete constraints.video.facingMode;
        let matches;
        if (face.exact === "environment" || face.ideal === "environment") {
          matches = ["back", "rear"];
        } else if (face.exact === "user" || face.ideal === "user") {
          matches = ["front"];
        }
        if (matches) {
          return navigator2.mediaDevices.enumerateDevices().then((devices) => {
            devices = devices.filter((d2) => d2.kind === "videoinput");
            let dev = devices.find((d2) => matches.some((match) => d2.label.toLowerCase().includes(match)));
            if (!dev && devices.length && matches.includes("back")) {
              dev = devices[devices.length - 1];
            }
            if (dev) {
              constraints.video.deviceId = face.exact ? { exact: dev.deviceId } : { ideal: dev.deviceId };
            }
            constraints.video = constraintsToChrome_(constraints.video);
            logging("chrome: " + JSON.stringify(constraints));
            return func(constraints);
          });
        }
      }
      constraints.video = constraintsToChrome_(constraints.video);
    }
    logging("chrome: " + JSON.stringify(constraints));
    return func(constraints);
  };
  const shimError_ = function(e3) {
    if (browserDetails.version >= 64) {
      return e3;
    }
    return {
      name: {
        PermissionDeniedError: "NotAllowedError",
        PermissionDismissedError: "NotAllowedError",
        InvalidStateError: "NotAllowedError",
        DevicesNotFoundError: "NotFoundError",
        ConstraintNotSatisfiedError: "OverconstrainedError",
        TrackStartError: "NotReadableError",
        MediaDeviceFailedDueToShutdown: "NotAllowedError",
        MediaDeviceKillSwitchOn: "NotAllowedError",
        TabCaptureError: "AbortError",
        ScreenCaptureError: "AbortError",
        DeviceCaptureError: "AbortError"
      }[e3.name] || e3.name,
      message: e3.message,
      constraint: e3.constraint || e3.constraintName,
      toString() {
        return this.name + (this.message && ": ") + this.message;
      }
    };
  };
  const getUserMedia_ = function(constraints, onSuccess, onError) {
    shimConstraints_(constraints, (c2) => {
      navigator2.webkitGetUserMedia(c2, onSuccess, (e3) => {
        if (onError) {
          onError(shimError_(e3));
        }
      });
    });
  };
  navigator2.getUserMedia = getUserMedia_.bind(navigator2);
  if (navigator2.mediaDevices.getUserMedia) {
    const origGetUserMedia = navigator2.mediaDevices.getUserMedia.bind(navigator2.mediaDevices);
    navigator2.mediaDevices.getUserMedia = function(cs) {
      return shimConstraints_(cs, (c2) => origGetUserMedia(c2).then((stream) => {
        if (c2.audio && !stream.getAudioTracks().length || c2.video && !stream.getVideoTracks().length) {
          stream.getTracks().forEach((track) => {
            track.stop();
          });
          throw new DOMException("", "NotFoundError");
        }
        return stream;
      }, (e3) => Promise.reject(shimError_(e3))));
    };
  }
}

// node_modules/webrtc-adapter/src/js/chrome/chrome_shim.js
function shimMediaStream(window2) {
  window2.MediaStream = window2.MediaStream || window2.webkitMediaStream;
}
function shimOnTrack(window2) {
  if (typeof window2 === "object" && window2.RTCPeerConnection && !("ontrack" in window2.RTCPeerConnection.prototype)) {
    Object.defineProperty(window2.RTCPeerConnection.prototype, "ontrack", {
      get() {
        return this._ontrack;
      },
      set(f2) {
        if (this._ontrack) {
          this.removeEventListener("track", this._ontrack);
        }
        this.addEventListener("track", this._ontrack = f2);
      },
      enumerable: true,
      configurable: true
    });
    const origSetRemoteDescription = window2.RTCPeerConnection.prototype.setRemoteDescription;
    window2.RTCPeerConnection.prototype.setRemoteDescription = function setRemoteDescription() {
      if (!this._ontrackpoly) {
        this._ontrackpoly = (e3) => {
          e3.stream.addEventListener("addtrack", (te) => {
            let receiver;
            if (window2.RTCPeerConnection.prototype.getReceivers) {
              receiver = this.getReceivers().find((r2) => r2.track && r2.track.id === te.track.id);
            } else {
              receiver = { track: te.track };
            }
            const event = new Event("track");
            event.track = te.track;
            event.receiver = receiver;
            event.transceiver = { receiver };
            event.streams = [e3.stream];
            this.dispatchEvent(event);
          });
          e3.stream.getTracks().forEach((track) => {
            let receiver;
            if (window2.RTCPeerConnection.prototype.getReceivers) {
              receiver = this.getReceivers().find((r2) => r2.track && r2.track.id === track.id);
            } else {
              receiver = { track };
            }
            const event = new Event("track");
            event.track = track;
            event.receiver = receiver;
            event.transceiver = { receiver };
            event.streams = [e3.stream];
            this.dispatchEvent(event);
          });
        };
        this.addEventListener("addstream", this._ontrackpoly);
      }
      return origSetRemoteDescription.apply(this, arguments);
    };
  } else {
    wrapPeerConnectionEvent(window2, "track", (e3) => {
      if (!e3.transceiver) {
        Object.defineProperty(
          e3,
          "transceiver",
          { value: { receiver: e3.receiver } }
        );
      }
      return e3;
    });
  }
}
function shimGetSendersWithDtmf(window2) {
  if (typeof window2 === "object" && window2.RTCPeerConnection && !("getSenders" in window2.RTCPeerConnection.prototype) && "createDTMFSender" in window2.RTCPeerConnection.prototype) {
    const shimSenderWithDtmf = function(pc, track) {
      return {
        track,
        get dtmf() {
          if (this._dtmf === void 0) {
            if (track.kind === "audio") {
              this._dtmf = pc.createDTMFSender(track);
            } else {
              this._dtmf = null;
            }
          }
          return this._dtmf;
        },
        _pc: pc
      };
    };
    if (!window2.RTCPeerConnection.prototype.getSenders) {
      window2.RTCPeerConnection.prototype.getSenders = function getSenders() {
        this._senders = this._senders || [];
        return this._senders.slice();
      };
      const origAddTrack = window2.RTCPeerConnection.prototype.addTrack;
      window2.RTCPeerConnection.prototype.addTrack = function addTrack(track, stream) {
        let sender = origAddTrack.apply(this, arguments);
        if (!sender) {
          sender = shimSenderWithDtmf(this, track);
          this._senders.push(sender);
        }
        return sender;
      };
      const origRemoveTrack = window2.RTCPeerConnection.prototype.removeTrack;
      window2.RTCPeerConnection.prototype.removeTrack = function removeTrack(sender) {
        origRemoveTrack.apply(this, arguments);
        const idx = this._senders.indexOf(sender);
        if (idx !== -1) {
          this._senders.splice(idx, 1);
        }
      };
    }
    const origAddStream = window2.RTCPeerConnection.prototype.addStream;
    window2.RTCPeerConnection.prototype.addStream = function addStream(stream) {
      this._senders = this._senders || [];
      origAddStream.apply(this, [stream]);
      stream.getTracks().forEach((track) => {
        this._senders.push(shimSenderWithDtmf(this, track));
      });
    };
    const origRemoveStream = window2.RTCPeerConnection.prototype.removeStream;
    window2.RTCPeerConnection.prototype.removeStream = function removeStream(stream) {
      this._senders = this._senders || [];
      origRemoveStream.apply(this, [stream]);
      stream.getTracks().forEach((track) => {
        const sender = this._senders.find((s2) => s2.track === track);
        if (sender) {
          this._senders.splice(this._senders.indexOf(sender), 1);
        }
      });
    };
  } else if (typeof window2 === "object" && window2.RTCPeerConnection && "getSenders" in window2.RTCPeerConnection.prototype && "createDTMFSender" in window2.RTCPeerConnection.prototype && window2.RTCRtpSender && !("dtmf" in window2.RTCRtpSender.prototype)) {
    const origGetSenders = window2.RTCPeerConnection.prototype.getSenders;
    window2.RTCPeerConnection.prototype.getSenders = function getSenders() {
      const senders = origGetSenders.apply(this, []);
      senders.forEach((sender) => sender._pc = this);
      return senders;
    };
    Object.defineProperty(window2.RTCRtpSender.prototype, "dtmf", {
      get() {
        if (this._dtmf === void 0) {
          if (this.track.kind === "audio") {
            this._dtmf = this._pc.createDTMFSender(this.track);
          } else {
            this._dtmf = null;
          }
        }
        return this._dtmf;
      }
    });
  }
}
function shimSenderReceiverGetStats(window2) {
  if (!(typeof window2 === "object" && window2.RTCPeerConnection && window2.RTCRtpSender && window2.RTCRtpReceiver)) {
    return;
  }
  if (!("getStats" in window2.RTCRtpSender.prototype)) {
    const origGetSenders = window2.RTCPeerConnection.prototype.getSenders;
    if (origGetSenders) {
      window2.RTCPeerConnection.prototype.getSenders = function getSenders() {
        const senders = origGetSenders.apply(this, []);
        senders.forEach((sender) => sender._pc = this);
        return senders;
      };
    }
    const origAddTrack = window2.RTCPeerConnection.prototype.addTrack;
    if (origAddTrack) {
      window2.RTCPeerConnection.prototype.addTrack = function addTrack() {
        const sender = origAddTrack.apply(this, arguments);
        sender._pc = this;
        return sender;
      };
    }
    window2.RTCRtpSender.prototype.getStats = function getStats() {
      const sender = this;
      return this._pc.getStats().then((result) => (
        /* Note: this will include stats of all senders that
         *   send a track with the same id as sender.track as
         *   it is not possible to identify the RTCRtpSender.
         */
        filterStats(result, sender.track, true)
      ));
    };
  }
  if (!("getStats" in window2.RTCRtpReceiver.prototype)) {
    const origGetReceivers = window2.RTCPeerConnection.prototype.getReceivers;
    if (origGetReceivers) {
      window2.RTCPeerConnection.prototype.getReceivers = function getReceivers() {
        const receivers = origGetReceivers.apply(this, []);
        receivers.forEach((receiver) => receiver._pc = this);
        return receivers;
      };
    }
    wrapPeerConnectionEvent(window2, "track", (e3) => {
      e3.receiver._pc = e3.srcElement;
      return e3;
    });
    window2.RTCRtpReceiver.prototype.getStats = function getStats() {
      const receiver = this;
      return this._pc.getStats().then((result) => filterStats(result, receiver.track, false));
    };
  }
  if (!("getStats" in window2.RTCRtpSender.prototype && "getStats" in window2.RTCRtpReceiver.prototype)) {
    return;
  }
  const origGetStats = window2.RTCPeerConnection.prototype.getStats;
  window2.RTCPeerConnection.prototype.getStats = function getStats() {
    if (arguments.length > 0 && arguments[0] instanceof window2.MediaStreamTrack) {
      const track = arguments[0];
      let sender;
      let receiver;
      let err;
      this.getSenders().forEach((s2) => {
        if (s2.track === track) {
          if (sender) {
            err = true;
          } else {
            sender = s2;
          }
        }
      });
      this.getReceivers().forEach((r2) => {
        if (r2.track === track) {
          if (receiver) {
            err = true;
          } else {
            receiver = r2;
          }
        }
        return r2.track === track;
      });
      if (err || sender && receiver) {
        return Promise.reject(new DOMException(
          "There are more than one sender or receiver for the track.",
          "InvalidAccessError"
        ));
      } else if (sender) {
        return sender.getStats();
      } else if (receiver) {
        return receiver.getStats();
      }
      return Promise.reject(new DOMException(
        "There is no sender or receiver for the track.",
        "InvalidAccessError"
      ));
    }
    return origGetStats.apply(this, arguments);
  };
}
function shimAddTrackRemoveTrackWithNative(window2) {
  window2.RTCPeerConnection.prototype.getLocalStreams = function getLocalStreams() {
    this._shimmedLocalStreams = this._shimmedLocalStreams || {};
    return Object.keys(this._shimmedLocalStreams).map((streamId) => this._shimmedLocalStreams[streamId][0]);
  };
  const origAddTrack = window2.RTCPeerConnection.prototype.addTrack;
  window2.RTCPeerConnection.prototype.addTrack = function addTrack(track, stream) {
    if (!stream) {
      return origAddTrack.apply(this, arguments);
    }
    this._shimmedLocalStreams = this._shimmedLocalStreams || {};
    const sender = origAddTrack.apply(this, arguments);
    if (!this._shimmedLocalStreams[stream.id]) {
      this._shimmedLocalStreams[stream.id] = [stream, sender];
    } else if (this._shimmedLocalStreams[stream.id].indexOf(sender) === -1) {
      this._shimmedLocalStreams[stream.id].push(sender);
    }
    return sender;
  };
  const origAddStream = window2.RTCPeerConnection.prototype.addStream;
  window2.RTCPeerConnection.prototype.addStream = function addStream(stream) {
    this._shimmedLocalStreams = this._shimmedLocalStreams || {};
    stream.getTracks().forEach((track) => {
      const alreadyExists = this.getSenders().find((s2) => s2.track === track);
      if (alreadyExists) {
        throw new DOMException(
          "Track already exists.",
          "InvalidAccessError"
        );
      }
    });
    const existingSenders = this.getSenders();
    origAddStream.apply(this, arguments);
    const newSenders = this.getSenders().filter((newSender) => existingSenders.indexOf(newSender) === -1);
    this._shimmedLocalStreams[stream.id] = [stream].concat(newSenders);
  };
  const origRemoveStream = window2.RTCPeerConnection.prototype.removeStream;
  window2.RTCPeerConnection.prototype.removeStream = function removeStream(stream) {
    this._shimmedLocalStreams = this._shimmedLocalStreams || {};
    delete this._shimmedLocalStreams[stream.id];
    return origRemoveStream.apply(this, arguments);
  };
  const origRemoveTrack = window2.RTCPeerConnection.prototype.removeTrack;
  window2.RTCPeerConnection.prototype.removeTrack = function removeTrack(sender) {
    this._shimmedLocalStreams = this._shimmedLocalStreams || {};
    if (sender) {
      Object.keys(this._shimmedLocalStreams).forEach((streamId) => {
        const idx = this._shimmedLocalStreams[streamId].indexOf(sender);
        if (idx !== -1) {
          this._shimmedLocalStreams[streamId].splice(idx, 1);
        }
        if (this._shimmedLocalStreams[streamId].length === 1) {
          delete this._shimmedLocalStreams[streamId];
        }
      });
    }
    return origRemoveTrack.apply(this, arguments);
  };
}
function shimAddTrackRemoveTrack(window2, browserDetails) {
  if (!window2.RTCPeerConnection) {
    return;
  }
  if (window2.RTCPeerConnection.prototype.addTrack && browserDetails.version >= 65) {
    return shimAddTrackRemoveTrackWithNative(window2);
  }
  const origGetLocalStreams = window2.RTCPeerConnection.prototype.getLocalStreams;
  window2.RTCPeerConnection.prototype.getLocalStreams = function getLocalStreams() {
    const nativeStreams = origGetLocalStreams.apply(this);
    this._reverseStreams = this._reverseStreams || {};
    return nativeStreams.map((stream) => this._reverseStreams[stream.id]);
  };
  const origAddStream = window2.RTCPeerConnection.prototype.addStream;
  window2.RTCPeerConnection.prototype.addStream = function addStream(stream) {
    this._streams = this._streams || {};
    this._reverseStreams = this._reverseStreams || {};
    stream.getTracks().forEach((track) => {
      const alreadyExists = this.getSenders().find((s2) => s2.track === track);
      if (alreadyExists) {
        throw new DOMException(
          "Track already exists.",
          "InvalidAccessError"
        );
      }
    });
    if (!this._reverseStreams[stream.id]) {
      const newStream = new window2.MediaStream(stream.getTracks());
      this._streams[stream.id] = newStream;
      this._reverseStreams[newStream.id] = stream;
      stream = newStream;
    }
    origAddStream.apply(this, [stream]);
  };
  const origRemoveStream = window2.RTCPeerConnection.prototype.removeStream;
  window2.RTCPeerConnection.prototype.removeStream = function removeStream(stream) {
    this._streams = this._streams || {};
    this._reverseStreams = this._reverseStreams || {};
    origRemoveStream.apply(this, [this._streams[stream.id] || stream]);
    delete this._reverseStreams[this._streams[stream.id] ? this._streams[stream.id].id : stream.id];
    delete this._streams[stream.id];
  };
  window2.RTCPeerConnection.prototype.addTrack = function addTrack(track, stream) {
    if (this.signalingState === "closed") {
      throw new DOMException(
        "The RTCPeerConnection's signalingState is 'closed'.",
        "InvalidStateError"
      );
    }
    const streams = [].slice.call(arguments, 1);
    if (streams.length !== 1 || !streams[0].getTracks().find((t2) => t2 === track)) {
      throw new DOMException(
        "The adapter.js addTrack polyfill only supports a single  stream which is associated with the specified track.",
        "NotSupportedError"
      );
    }
    const alreadyExists = this.getSenders().find((s2) => s2.track === track);
    if (alreadyExists) {
      throw new DOMException(
        "Track already exists.",
        "InvalidAccessError"
      );
    }
    this._streams = this._streams || {};
    this._reverseStreams = this._reverseStreams || {};
    const oldStream = this._streams[stream.id];
    if (oldStream) {
      oldStream.addTrack(track);
      Promise.resolve().then(() => {
        this.dispatchEvent(new Event("negotiationneeded"));
      });
    } else {
      const newStream = new window2.MediaStream([track]);
      this._streams[stream.id] = newStream;
      this._reverseStreams[newStream.id] = stream;
      this.addStream(newStream);
    }
    return this.getSenders().find((s2) => s2.track === track);
  };
  function replaceInternalStreamId(pc, description) {
    let sdp2 = description.sdp;
    Object.keys(pc._reverseStreams || []).forEach((internalId) => {
      const externalStream = pc._reverseStreams[internalId];
      const internalStream = pc._streams[externalStream.id];
      sdp2 = sdp2.replace(
        new RegExp(internalStream.id, "g"),
        externalStream.id
      );
    });
    return new RTCSessionDescription({
      type: description.type,
      sdp: sdp2
    });
  }
  function replaceExternalStreamId(pc, description) {
    let sdp2 = description.sdp;
    Object.keys(pc._reverseStreams || []).forEach((internalId) => {
      const externalStream = pc._reverseStreams[internalId];
      const internalStream = pc._streams[externalStream.id];
      sdp2 = sdp2.replace(
        new RegExp(externalStream.id, "g"),
        internalStream.id
      );
    });
    return new RTCSessionDescription({
      type: description.type,
      sdp: sdp2
    });
  }
  ["createOffer", "createAnswer"].forEach(function(method) {
    const nativeMethod = window2.RTCPeerConnection.prototype[method];
    const methodObj = { [method]() {
      const args = arguments;
      const isLegacyCall = arguments.length && typeof arguments[0] === "function";
      if (isLegacyCall) {
        return nativeMethod.apply(this, [
          (description) => {
            const desc = replaceInternalStreamId(this, description);
            args[0].apply(null, [desc]);
          },
          (err) => {
            if (args[1]) {
              args[1].apply(null, err);
            }
          },
          arguments[2]
        ]);
      }
      return nativeMethod.apply(this, arguments).then((description) => replaceInternalStreamId(this, description));
    } };
    window2.RTCPeerConnection.prototype[method] = methodObj[method];
  });
  const origSetLocalDescription = window2.RTCPeerConnection.prototype.setLocalDescription;
  window2.RTCPeerConnection.prototype.setLocalDescription = function setLocalDescription() {
    if (!arguments.length || !arguments[0].type) {
      return origSetLocalDescription.apply(this, arguments);
    }
    arguments[0] = replaceExternalStreamId(this, arguments[0]);
    return origSetLocalDescription.apply(this, arguments);
  };
  const origLocalDescription = Object.getOwnPropertyDescriptor(
    window2.RTCPeerConnection.prototype,
    "localDescription"
  );
  Object.defineProperty(
    window2.RTCPeerConnection.prototype,
    "localDescription",
    {
      get() {
        const description = origLocalDescription.get.apply(this);
        if (description.type === "") {
          return description;
        }
        return replaceInternalStreamId(this, description);
      }
    }
  );
  window2.RTCPeerConnection.prototype.removeTrack = function removeTrack(sender) {
    if (this.signalingState === "closed") {
      throw new DOMException(
        "The RTCPeerConnection's signalingState is 'closed'.",
        "InvalidStateError"
      );
    }
    if (!sender._pc) {
      throw new DOMException("Argument 1 of RTCPeerConnection.removeTrack does not implement interface RTCRtpSender.", "TypeError");
    }
    const isLocal = sender._pc === this;
    if (!isLocal) {
      throw new DOMException(
        "Sender was not created by this connection.",
        "InvalidAccessError"
      );
    }
    this._streams = this._streams || {};
    let stream;
    Object.keys(this._streams).forEach((streamid) => {
      const hasTrack = this._streams[streamid].getTracks().find((track) => sender.track === track);
      if (hasTrack) {
        stream = this._streams[streamid];
      }
    });
    if (stream) {
      if (stream.getTracks().length === 1) {
        this.removeStream(this._reverseStreams[stream.id]);
      } else {
        stream.removeTrack(sender.track);
      }
      this.dispatchEvent(new Event("negotiationneeded"));
    }
  };
}
function shimPeerConnection(window2, browserDetails) {
  if (!window2.RTCPeerConnection && window2.webkitRTCPeerConnection) {
    window2.RTCPeerConnection = window2.webkitRTCPeerConnection;
  }
  if (!window2.RTCPeerConnection) {
    return;
  }
  if (browserDetails.version < 53) {
    ["setLocalDescription", "setRemoteDescription", "addIceCandidate"].forEach(function(method) {
      const nativeMethod = window2.RTCPeerConnection.prototype[method];
      const methodObj = { [method]() {
        arguments[0] = new (method === "addIceCandidate" ? window2.RTCIceCandidate : window2.RTCSessionDescription)(arguments[0]);
        return nativeMethod.apply(this, arguments);
      } };
      window2.RTCPeerConnection.prototype[method] = methodObj[method];
    });
  }
}
function fixNegotiationNeeded(window2, browserDetails) {
  wrapPeerConnectionEvent(window2, "negotiationneeded", (e3) => {
    const pc = e3.target;
    if (browserDetails.version < 72 || pc.getConfiguration && pc.getConfiguration().sdpSemantics === "plan-b") {
      if (pc.signalingState !== "stable") {
        return;
      }
    }
    return e3;
  });
}

// node_modules/webrtc-adapter/src/js/firefox/firefox_shim.js
var firefox_shim_exports = {};
__export(firefox_shim_exports, {
  shimAddTransceiver: () => shimAddTransceiver,
  shimCreateAnswer: () => shimCreateAnswer,
  shimCreateOffer: () => shimCreateOffer,
  shimGetDisplayMedia: () => shimGetDisplayMedia,
  shimGetParameters: () => shimGetParameters,
  shimGetUserMedia: () => shimGetUserMedia2,
  shimOnTrack: () => shimOnTrack2,
  shimPeerConnection: () => shimPeerConnection2,
  shimRTCDataChannel: () => shimRTCDataChannel,
  shimReceiverGetStats: () => shimReceiverGetStats,
  shimRemoveStream: () => shimRemoveStream,
  shimSenderGetStats: () => shimSenderGetStats
});

// node_modules/webrtc-adapter/src/js/firefox/getusermedia.js
function shimGetUserMedia2(window2, browserDetails) {
  const navigator2 = window2 && window2.navigator;
  const MediaStreamTrack = window2 && window2.MediaStreamTrack;
  navigator2.getUserMedia = function(constraints, onSuccess, onError) {
    deprecated(
      "navigator.getUserMedia",
      "navigator.mediaDevices.getUserMedia"
    );
    navigator2.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);
  };
  if (!(browserDetails.version > 55 && "autoGainControl" in navigator2.mediaDevices.getSupportedConstraints())) {
    const remap = function(obj, a2, b) {
      if (a2 in obj && !(b in obj)) {
        obj[b] = obj[a2];
        delete obj[a2];
      }
    };
    const nativeGetUserMedia = navigator2.mediaDevices.getUserMedia.bind(navigator2.mediaDevices);
    navigator2.mediaDevices.getUserMedia = function(c2) {
      if (typeof c2 === "object" && typeof c2.audio === "object") {
        c2 = JSON.parse(JSON.stringify(c2));
        remap(c2.audio, "autoGainControl", "mozAutoGainControl");
        remap(c2.audio, "noiseSuppression", "mozNoiseSuppression");
      }
      return nativeGetUserMedia(c2);
    };
    if (MediaStreamTrack && MediaStreamTrack.prototype.getSettings) {
      const nativeGetSettings = MediaStreamTrack.prototype.getSettings;
      MediaStreamTrack.prototype.getSettings = function() {
        const obj = nativeGetSettings.apply(this, arguments);
        remap(obj, "mozAutoGainControl", "autoGainControl");
        remap(obj, "mozNoiseSuppression", "noiseSuppression");
        return obj;
      };
    }
    if (MediaStreamTrack && MediaStreamTrack.prototype.applyConstraints) {
      const nativeApplyConstraints = MediaStreamTrack.prototype.applyConstraints;
      MediaStreamTrack.prototype.applyConstraints = function(c2) {
        if (this.kind === "audio" && typeof c2 === "object") {
          c2 = JSON.parse(JSON.stringify(c2));
          remap(c2, "autoGainControl", "mozAutoGainControl");
          remap(c2, "noiseSuppression", "mozNoiseSuppression");
        }
        return nativeApplyConstraints.apply(this, [c2]);
      };
    }
  }
}

// node_modules/webrtc-adapter/src/js/firefox/getdisplaymedia.js
function shimGetDisplayMedia(window2, preferredMediaSource) {
  if (window2.navigator.mediaDevices && "getDisplayMedia" in window2.navigator.mediaDevices) {
    return;
  }
  if (!window2.navigator.mediaDevices) {
    return;
  }
  window2.navigator.mediaDevices.getDisplayMedia = function getDisplayMedia(constraints) {
    if (!(constraints && constraints.video)) {
      const err = new DOMException("getDisplayMedia without video constraints is undefined");
      err.name = "NotFoundError";
      err.code = 8;
      return Promise.reject(err);
    }
    if (constraints.video === true) {
      constraints.video = { mediaSource: preferredMediaSource };
    } else {
      constraints.video.mediaSource = preferredMediaSource;
    }
    return window2.navigator.mediaDevices.getUserMedia(constraints);
  };
}

// node_modules/webrtc-adapter/src/js/firefox/firefox_shim.js
function shimOnTrack2(window2) {
  if (typeof window2 === "object" && window2.RTCTrackEvent && "receiver" in window2.RTCTrackEvent.prototype && !("transceiver" in window2.RTCTrackEvent.prototype)) {
    Object.defineProperty(window2.RTCTrackEvent.prototype, "transceiver", {
      get() {
        return { receiver: this.receiver };
      }
    });
  }
}
function shimPeerConnection2(window2, browserDetails) {
  if (typeof window2 !== "object" || !(window2.RTCPeerConnection || window2.mozRTCPeerConnection)) {
    return;
  }
  if (!window2.RTCPeerConnection && window2.mozRTCPeerConnection) {
    window2.RTCPeerConnection = window2.mozRTCPeerConnection;
  }
  if (browserDetails.version < 53) {
    ["setLocalDescription", "setRemoteDescription", "addIceCandidate"].forEach(function(method) {
      const nativeMethod = window2.RTCPeerConnection.prototype[method];
      const methodObj = { [method]() {
        arguments[0] = new (method === "addIceCandidate" ? window2.RTCIceCandidate : window2.RTCSessionDescription)(arguments[0]);
        return nativeMethod.apply(this, arguments);
      } };
      window2.RTCPeerConnection.prototype[method] = methodObj[method];
    });
  }
  const modernStatsTypes = {
    inboundrtp: "inbound-rtp",
    outboundrtp: "outbound-rtp",
    candidatepair: "candidate-pair",
    localcandidate: "local-candidate",
    remotecandidate: "remote-candidate"
  };
  const nativeGetStats = window2.RTCPeerConnection.prototype.getStats;
  window2.RTCPeerConnection.prototype.getStats = function getStats() {
    const [selector, onSucc, onErr] = arguments;
    return nativeGetStats.apply(this, [selector || null]).then((stats) => {
      if (browserDetails.version < 53 && !onSucc) {
        try {
          stats.forEach((stat) => {
            stat.type = modernStatsTypes[stat.type] || stat.type;
          });
        } catch (e3) {
          if (e3.name !== "TypeError") {
            throw e3;
          }
          stats.forEach((stat, i2) => {
            stats.set(i2, Object.assign({}, stat, {
              type: modernStatsTypes[stat.type] || stat.type
            }));
          });
        }
      }
      return stats;
    }).then(onSucc, onErr);
  };
}
function shimSenderGetStats(window2) {
  if (!(typeof window2 === "object" && window2.RTCPeerConnection && window2.RTCRtpSender)) {
    return;
  }
  if (window2.RTCRtpSender && "getStats" in window2.RTCRtpSender.prototype) {
    return;
  }
  const origGetSenders = window2.RTCPeerConnection.prototype.getSenders;
  if (origGetSenders) {
    window2.RTCPeerConnection.prototype.getSenders = function getSenders() {
      const senders = origGetSenders.apply(this, []);
      senders.forEach((sender) => sender._pc = this);
      return senders;
    };
  }
  const origAddTrack = window2.RTCPeerConnection.prototype.addTrack;
  if (origAddTrack) {
    window2.RTCPeerConnection.prototype.addTrack = function addTrack() {
      const sender = origAddTrack.apply(this, arguments);
      sender._pc = this;
      return sender;
    };
  }
  window2.RTCRtpSender.prototype.getStats = function getStats() {
    return this.track ? this._pc.getStats(this.track) : Promise.resolve(/* @__PURE__ */ new Map());
  };
}
function shimReceiverGetStats(window2) {
  if (!(typeof window2 === "object" && window2.RTCPeerConnection && window2.RTCRtpSender)) {
    return;
  }
  if (window2.RTCRtpSender && "getStats" in window2.RTCRtpReceiver.prototype) {
    return;
  }
  const origGetReceivers = window2.RTCPeerConnection.prototype.getReceivers;
  if (origGetReceivers) {
    window2.RTCPeerConnection.prototype.getReceivers = function getReceivers() {
      const receivers = origGetReceivers.apply(this, []);
      receivers.forEach((receiver) => receiver._pc = this);
      return receivers;
    };
  }
  wrapPeerConnectionEvent(window2, "track", (e3) => {
    e3.receiver._pc = e3.srcElement;
    return e3;
  });
  window2.RTCRtpReceiver.prototype.getStats = function getStats() {
    return this._pc.getStats(this.track);
  };
}
function shimRemoveStream(window2) {
  if (!window2.RTCPeerConnection || "removeStream" in window2.RTCPeerConnection.prototype) {
    return;
  }
  window2.RTCPeerConnection.prototype.removeStream = function removeStream(stream) {
    deprecated("removeStream", "removeTrack");
    this.getSenders().forEach((sender) => {
      if (sender.track && stream.getTracks().includes(sender.track)) {
        this.removeTrack(sender);
      }
    });
  };
}
function shimRTCDataChannel(window2) {
  if (window2.DataChannel && !window2.RTCDataChannel) {
    window2.RTCDataChannel = window2.DataChannel;
  }
}
function shimAddTransceiver(window2) {
  if (!(typeof window2 === "object" && window2.RTCPeerConnection)) {
    return;
  }
  const origAddTransceiver = window2.RTCPeerConnection.prototype.addTransceiver;
  if (origAddTransceiver) {
    window2.RTCPeerConnection.prototype.addTransceiver = function addTransceiver() {
      this.setParametersPromises = [];
      let sendEncodings = arguments[1] && arguments[1].sendEncodings;
      if (sendEncodings === void 0) {
        sendEncodings = [];
      }
      sendEncodings = [...sendEncodings];
      const shouldPerformCheck = sendEncodings.length > 0;
      if (shouldPerformCheck) {
        sendEncodings.forEach((encodingParam) => {
          if ("rid" in encodingParam) {
            const ridRegex = /^[a-z0-9]{0,16}$/i;
            if (!ridRegex.test(encodingParam.rid)) {
              throw new TypeError("Invalid RID value provided.");
            }
          }
          if ("scaleResolutionDownBy" in encodingParam) {
            if (!(parseFloat(encodingParam.scaleResolutionDownBy) >= 1)) {
              throw new RangeError("scale_resolution_down_by must be >= 1.0");
            }
          }
          if ("maxFramerate" in encodingParam) {
            if (!(parseFloat(encodingParam.maxFramerate) >= 0)) {
              throw new RangeError("max_framerate must be >= 0.0");
            }
          }
        });
      }
      const transceiver = origAddTransceiver.apply(this, arguments);
      if (shouldPerformCheck) {
        const { sender } = transceiver;
        const params = sender.getParameters();
        if (!("encodings" in params) || // Avoid being fooled by patched getParameters() below.
        params.encodings.length === 1 && Object.keys(params.encodings[0]).length === 0) {
          params.encodings = sendEncodings;
          sender.sendEncodings = sendEncodings;
          this.setParametersPromises.push(
            sender.setParameters(params).then(() => {
              delete sender.sendEncodings;
            }).catch(() => {
              delete sender.sendEncodings;
            })
          );
        }
      }
      return transceiver;
    };
  }
}
function shimGetParameters(window2) {
  if (!(typeof window2 === "object" && window2.RTCRtpSender)) {
    return;
  }
  const origGetParameters = window2.RTCRtpSender.prototype.getParameters;
  if (origGetParameters) {
    window2.RTCRtpSender.prototype.getParameters = function getParameters() {
      const params = origGetParameters.apply(this, arguments);
      if (!("encodings" in params)) {
        params.encodings = [].concat(this.sendEncodings || [{}]);
      }
      return params;
    };
  }
}
function shimCreateOffer(window2) {
  if (!(typeof window2 === "object" && window2.RTCPeerConnection)) {
    return;
  }
  const origCreateOffer = window2.RTCPeerConnection.prototype.createOffer;
  window2.RTCPeerConnection.prototype.createOffer = function createOffer() {
    if (this.setParametersPromises && this.setParametersPromises.length) {
      return Promise.all(this.setParametersPromises).then(() => {
        return origCreateOffer.apply(this, arguments);
      }).finally(() => {
        this.setParametersPromises = [];
      });
    }
    return origCreateOffer.apply(this, arguments);
  };
}
function shimCreateAnswer(window2) {
  if (!(typeof window2 === "object" && window2.RTCPeerConnection)) {
    return;
  }
  const origCreateAnswer = window2.RTCPeerConnection.prototype.createAnswer;
  window2.RTCPeerConnection.prototype.createAnswer = function createAnswer() {
    if (this.setParametersPromises && this.setParametersPromises.length) {
      return Promise.all(this.setParametersPromises).then(() => {
        return origCreateAnswer.apply(this, arguments);
      }).finally(() => {
        this.setParametersPromises = [];
      });
    }
    return origCreateAnswer.apply(this, arguments);
  };
}

// node_modules/webrtc-adapter/src/js/safari/safari_shim.js
var safari_shim_exports = {};
__export(safari_shim_exports, {
  shimAudioContext: () => shimAudioContext,
  shimCallbacksAPI: () => shimCallbacksAPI,
  shimConstraints: () => shimConstraints,
  shimCreateOfferLegacy: () => shimCreateOfferLegacy,
  shimGetUserMedia: () => shimGetUserMedia3,
  shimLocalStreamsAPI: () => shimLocalStreamsAPI,
  shimRTCIceServerUrls: () => shimRTCIceServerUrls,
  shimRemoteStreamsAPI: () => shimRemoteStreamsAPI,
  shimTrackEventTransceiver: () => shimTrackEventTransceiver
});
function shimLocalStreamsAPI(window2) {
  if (typeof window2 !== "object" || !window2.RTCPeerConnection) {
    return;
  }
  if (!("getLocalStreams" in window2.RTCPeerConnection.prototype)) {
    window2.RTCPeerConnection.prototype.getLocalStreams = function getLocalStreams() {
      if (!this._localStreams) {
        this._localStreams = [];
      }
      return this._localStreams;
    };
  }
  if (!("addStream" in window2.RTCPeerConnection.prototype)) {
    const _addTrack = window2.RTCPeerConnection.prototype.addTrack;
    window2.RTCPeerConnection.prototype.addStream = function addStream(stream) {
      if (!this._localStreams) {
        this._localStreams = [];
      }
      if (!this._localStreams.includes(stream)) {
        this._localStreams.push(stream);
      }
      stream.getAudioTracks().forEach((track) => _addTrack.call(
        this,
        track,
        stream
      ));
      stream.getVideoTracks().forEach((track) => _addTrack.call(
        this,
        track,
        stream
      ));
    };
    window2.RTCPeerConnection.prototype.addTrack = function addTrack(track, ...streams) {
      if (streams) {
        streams.forEach((stream) => {
          if (!this._localStreams) {
            this._localStreams = [stream];
          } else if (!this._localStreams.includes(stream)) {
            this._localStreams.push(stream);
          }
        });
      }
      return _addTrack.apply(this, arguments);
    };
  }
  if (!("removeStream" in window2.RTCPeerConnection.prototype)) {
    window2.RTCPeerConnection.prototype.removeStream = function removeStream(stream) {
      if (!this._localStreams) {
        this._localStreams = [];
      }
      const index = this._localStreams.indexOf(stream);
      if (index === -1) {
        return;
      }
      this._localStreams.splice(index, 1);
      const tracks = stream.getTracks();
      this.getSenders().forEach((sender) => {
        if (tracks.includes(sender.track)) {
          this.removeTrack(sender);
        }
      });
    };
  }
}
function shimRemoteStreamsAPI(window2) {
  if (typeof window2 !== "object" || !window2.RTCPeerConnection) {
    return;
  }
  if (!("getRemoteStreams" in window2.RTCPeerConnection.prototype)) {
    window2.RTCPeerConnection.prototype.getRemoteStreams = function getRemoteStreams() {
      return this._remoteStreams ? this._remoteStreams : [];
    };
  }
  if (!("onaddstream" in window2.RTCPeerConnection.prototype)) {
    Object.defineProperty(window2.RTCPeerConnection.prototype, "onaddstream", {
      get() {
        return this._onaddstream;
      },
      set(f2) {
        if (this._onaddstream) {
          this.removeEventListener("addstream", this._onaddstream);
          this.removeEventListener("track", this._onaddstreampoly);
        }
        this.addEventListener("addstream", this._onaddstream = f2);
        this.addEventListener("track", this._onaddstreampoly = (e3) => {
          e3.streams.forEach((stream) => {
            if (!this._remoteStreams) {
              this._remoteStreams = [];
            }
            if (this._remoteStreams.includes(stream)) {
              return;
            }
            this._remoteStreams.push(stream);
            const event = new Event("addstream");
            event.stream = stream;
            this.dispatchEvent(event);
          });
        });
      }
    });
    const origSetRemoteDescription = window2.RTCPeerConnection.prototype.setRemoteDescription;
    window2.RTCPeerConnection.prototype.setRemoteDescription = function setRemoteDescription() {
      const pc = this;
      if (!this._onaddstreampoly) {
        this.addEventListener("track", this._onaddstreampoly = function(e3) {
          e3.streams.forEach((stream) => {
            if (!pc._remoteStreams) {
              pc._remoteStreams = [];
            }
            if (pc._remoteStreams.indexOf(stream) >= 0) {
              return;
            }
            pc._remoteStreams.push(stream);
            const event = new Event("addstream");
            event.stream = stream;
            pc.dispatchEvent(event);
          });
        });
      }
      return origSetRemoteDescription.apply(pc, arguments);
    };
  }
}
function shimCallbacksAPI(window2) {
  if (typeof window2 !== "object" || !window2.RTCPeerConnection) {
    return;
  }
  const prototype = window2.RTCPeerConnection.prototype;
  const origCreateOffer = prototype.createOffer;
  const origCreateAnswer = prototype.createAnswer;
  const setLocalDescription = prototype.setLocalDescription;
  const setRemoteDescription = prototype.setRemoteDescription;
  const addIceCandidate = prototype.addIceCandidate;
  prototype.createOffer = function createOffer(successCallback, failureCallback) {
    const options = arguments.length >= 2 ? arguments[2] : arguments[0];
    const promise = origCreateOffer.apply(this, [options]);
    if (!failureCallback) {
      return promise;
    }
    promise.then(successCallback, failureCallback);
    return Promise.resolve();
  };
  prototype.createAnswer = function createAnswer(successCallback, failureCallback) {
    const options = arguments.length >= 2 ? arguments[2] : arguments[0];
    const promise = origCreateAnswer.apply(this, [options]);
    if (!failureCallback) {
      return promise;
    }
    promise.then(successCallback, failureCallback);
    return Promise.resolve();
  };
  let withCallback = function(description, successCallback, failureCallback) {
    const promise = setLocalDescription.apply(this, [description]);
    if (!failureCallback) {
      return promise;
    }
    promise.then(successCallback, failureCallback);
    return Promise.resolve();
  };
  prototype.setLocalDescription = withCallback;
  withCallback = function(description, successCallback, failureCallback) {
    const promise = setRemoteDescription.apply(this, [description]);
    if (!failureCallback) {
      return promise;
    }
    promise.then(successCallback, failureCallback);
    return Promise.resolve();
  };
  prototype.setRemoteDescription = withCallback;
  withCallback = function(candidate, successCallback, failureCallback) {
    const promise = addIceCandidate.apply(this, [candidate]);
    if (!failureCallback) {
      return promise;
    }
    promise.then(successCallback, failureCallback);
    return Promise.resolve();
  };
  prototype.addIceCandidate = withCallback;
}
function shimGetUserMedia3(window2) {
  const navigator2 = window2 && window2.navigator;
  if (navigator2.mediaDevices && navigator2.mediaDevices.getUserMedia) {
    const mediaDevices = navigator2.mediaDevices;
    const _getUserMedia = mediaDevices.getUserMedia.bind(mediaDevices);
    navigator2.mediaDevices.getUserMedia = (constraints) => {
      return _getUserMedia(shimConstraints(constraints));
    };
  }
  if (!navigator2.getUserMedia && navigator2.mediaDevices && navigator2.mediaDevices.getUserMedia) {
    navigator2.getUserMedia = (function getUserMedia(constraints, cb, errcb) {
      navigator2.mediaDevices.getUserMedia(constraints).then(cb, errcb);
    }).bind(navigator2);
  }
}
function shimConstraints(constraints) {
  if (constraints && constraints.video !== void 0) {
    return Object.assign(
      {},
      constraints,
      { video: compactObject(constraints.video) }
    );
  }
  return constraints;
}
function shimRTCIceServerUrls(window2) {
  if (!window2.RTCPeerConnection) {
    return;
  }
  const OrigPeerConnection = window2.RTCPeerConnection;
  window2.RTCPeerConnection = function RTCPeerConnection(pcConfig, pcConstraints) {
    if (pcConfig && pcConfig.iceServers) {
      const newIceServers = [];
      for (let i2 = 0; i2 < pcConfig.iceServers.length; i2++) {
        let server = pcConfig.iceServers[i2];
        if (server.urls === void 0 && server.url) {
          deprecated("RTCIceServer.url", "RTCIceServer.urls");
          server = JSON.parse(JSON.stringify(server));
          server.urls = server.url;
          delete server.url;
          newIceServers.push(server);
        } else {
          newIceServers.push(pcConfig.iceServers[i2]);
        }
      }
      pcConfig.iceServers = newIceServers;
    }
    return new OrigPeerConnection(pcConfig, pcConstraints);
  };
  window2.RTCPeerConnection.prototype = OrigPeerConnection.prototype;
  if ("generateCertificate" in OrigPeerConnection) {
    Object.defineProperty(window2.RTCPeerConnection, "generateCertificate", {
      get() {
        return OrigPeerConnection.generateCertificate;
      }
    });
  }
}
function shimTrackEventTransceiver(window2) {
  if (typeof window2 === "object" && window2.RTCTrackEvent && "receiver" in window2.RTCTrackEvent.prototype && !("transceiver" in window2.RTCTrackEvent.prototype)) {
    Object.defineProperty(window2.RTCTrackEvent.prototype, "transceiver", {
      get() {
        return { receiver: this.receiver };
      }
    });
  }
}
function shimCreateOfferLegacy(window2) {
  const origCreateOffer = window2.RTCPeerConnection.prototype.createOffer;
  window2.RTCPeerConnection.prototype.createOffer = function createOffer(offerOptions) {
    if (offerOptions) {
      if (typeof offerOptions.offerToReceiveAudio !== "undefined") {
        offerOptions.offerToReceiveAudio = !!offerOptions.offerToReceiveAudio;
      }
      const audioTransceiver = this.getTransceivers().find((transceiver) => transceiver.receiver.track.kind === "audio");
      if (offerOptions.offerToReceiveAudio === false && audioTransceiver) {
        if (audioTransceiver.direction === "sendrecv") {
          if (audioTransceiver.setDirection) {
            audioTransceiver.setDirection("sendonly");
          } else {
            audioTransceiver.direction = "sendonly";
          }
        } else if (audioTransceiver.direction === "recvonly") {
          if (audioTransceiver.setDirection) {
            audioTransceiver.setDirection("inactive");
          } else {
            audioTransceiver.direction = "inactive";
          }
        }
      } else if (offerOptions.offerToReceiveAudio === true && !audioTransceiver) {
        this.addTransceiver("audio", { direction: "recvonly" });
      }
      if (typeof offerOptions.offerToReceiveVideo !== "undefined") {
        offerOptions.offerToReceiveVideo = !!offerOptions.offerToReceiveVideo;
      }
      const videoTransceiver = this.getTransceivers().find((transceiver) => transceiver.receiver.track.kind === "video");
      if (offerOptions.offerToReceiveVideo === false && videoTransceiver) {
        if (videoTransceiver.direction === "sendrecv") {
          if (videoTransceiver.setDirection) {
            videoTransceiver.setDirection("sendonly");
          } else {
            videoTransceiver.direction = "sendonly";
          }
        } else if (videoTransceiver.direction === "recvonly") {
          if (videoTransceiver.setDirection) {
            videoTransceiver.setDirection("inactive");
          } else {
            videoTransceiver.direction = "inactive";
          }
        }
      } else if (offerOptions.offerToReceiveVideo === true && !videoTransceiver) {
        this.addTransceiver("video", { direction: "recvonly" });
      }
    }
    return origCreateOffer.apply(this, arguments);
  };
}
function shimAudioContext(window2) {
  if (typeof window2 !== "object" || window2.AudioContext) {
    return;
  }
  window2.AudioContext = window2.webkitAudioContext;
}

// node_modules/webrtc-adapter/src/js/common_shim.js
var common_shim_exports = {};
__export(common_shim_exports, {
  removeExtmapAllowMixed: () => removeExtmapAllowMixed,
  shimAddIceCandidateNullOrEmpty: () => shimAddIceCandidateNullOrEmpty,
  shimConnectionState: () => shimConnectionState,
  shimMaxMessageSize: () => shimMaxMessageSize,
  shimParameterlessSetLocalDescription: () => shimParameterlessSetLocalDescription,
  shimRTCIceCandidate: () => shimRTCIceCandidate,
  shimRTCIceCandidateRelayProtocol: () => shimRTCIceCandidateRelayProtocol,
  shimSendThrowTypeError: () => shimSendThrowTypeError
});
var import_sdp = __toESM(require_sdp());
function shimRTCIceCandidate(window2) {
  if (!window2.RTCIceCandidate || window2.RTCIceCandidate && "foundation" in window2.RTCIceCandidate.prototype) {
    return;
  }
  const NativeRTCIceCandidate = window2.RTCIceCandidate;
  window2.RTCIceCandidate = function RTCIceCandidate(args) {
    if (typeof args === "object" && args.candidate && args.candidate.indexOf("a=") === 0) {
      args = JSON.parse(JSON.stringify(args));
      args.candidate = args.candidate.substring(2);
    }
    if (args.candidate && args.candidate.length) {
      const nativeCandidate = new NativeRTCIceCandidate(args);
      const parsedCandidate = import_sdp.default.parseCandidate(args.candidate);
      for (const key in parsedCandidate) {
        if (!(key in nativeCandidate)) {
          Object.defineProperty(
            nativeCandidate,
            key,
            { value: parsedCandidate[key] }
          );
        }
      }
      nativeCandidate.toJSON = function toJSON() {
        return {
          candidate: nativeCandidate.candidate,
          sdpMid: nativeCandidate.sdpMid,
          sdpMLineIndex: nativeCandidate.sdpMLineIndex,
          usernameFragment: nativeCandidate.usernameFragment
        };
      };
      return nativeCandidate;
    }
    return new NativeRTCIceCandidate(args);
  };
  window2.RTCIceCandidate.prototype = NativeRTCIceCandidate.prototype;
  wrapPeerConnectionEvent(window2, "icecandidate", (e3) => {
    if (e3.candidate) {
      Object.defineProperty(e3, "candidate", {
        value: new window2.RTCIceCandidate(e3.candidate),
        writable: "false"
      });
    }
    return e3;
  });
}
function shimRTCIceCandidateRelayProtocol(window2) {
  if (!window2.RTCIceCandidate || window2.RTCIceCandidate && "relayProtocol" in window2.RTCIceCandidate.prototype) {
    return;
  }
  wrapPeerConnectionEvent(window2, "icecandidate", (e3) => {
    if (e3.candidate) {
      const parsedCandidate = import_sdp.default.parseCandidate(e3.candidate.candidate);
      if (parsedCandidate.type === "relay") {
        e3.candidate.relayProtocol = {
          0: "tls",
          1: "tcp",
          2: "udp"
        }[parsedCandidate.priority >> 24];
      }
    }
    return e3;
  });
}
function shimMaxMessageSize(window2, browserDetails) {
  if (!window2.RTCPeerConnection) {
    return;
  }
  if (!("sctp" in window2.RTCPeerConnection.prototype)) {
    Object.defineProperty(window2.RTCPeerConnection.prototype, "sctp", {
      get() {
        return typeof this._sctp === "undefined" ? null : this._sctp;
      }
    });
  }
  const sctpInDescription = function(description) {
    if (!description || !description.sdp) {
      return false;
    }
    const sections = import_sdp.default.splitSections(description.sdp);
    sections.shift();
    return sections.some((mediaSection) => {
      const mLine = import_sdp.default.parseMLine(mediaSection);
      return mLine && mLine.kind === "application" && mLine.protocol.indexOf("SCTP") !== -1;
    });
  };
  const getRemoteFirefoxVersion = function(description) {
    const match = description.sdp.match(/mozilla...THIS_IS_SDPARTA-(\d+)/);
    if (match === null || match.length < 2) {
      return -1;
    }
    const version = parseInt(match[1], 10);
    return version !== version ? -1 : version;
  };
  const getCanSendMaxMessageSize = function(remoteIsFirefox) {
    let canSendMaxMessageSize = 65536;
    if (browserDetails.browser === "firefox") {
      if (browserDetails.version < 57) {
        if (remoteIsFirefox === -1) {
          canSendMaxMessageSize = 16384;
        } else {
          canSendMaxMessageSize = 2147483637;
        }
      } else if (browserDetails.version < 60) {
        canSendMaxMessageSize = browserDetails.version === 57 ? 65535 : 65536;
      } else {
        canSendMaxMessageSize = 2147483637;
      }
    }
    return canSendMaxMessageSize;
  };
  const getMaxMessageSize = function(description, remoteIsFirefox) {
    let maxMessageSize = 65536;
    if (browserDetails.browser === "firefox" && browserDetails.version === 57) {
      maxMessageSize = 65535;
    }
    const match = import_sdp.default.matchPrefix(
      description.sdp,
      "a=max-message-size:"
    );
    if (match.length > 0) {
      maxMessageSize = parseInt(match[0].substring(19), 10);
    } else if (browserDetails.browser === "firefox" && remoteIsFirefox !== -1) {
      maxMessageSize = 2147483637;
    }
    return maxMessageSize;
  };
  const origSetRemoteDescription = window2.RTCPeerConnection.prototype.setRemoteDescription;
  window2.RTCPeerConnection.prototype.setRemoteDescription = function setRemoteDescription() {
    this._sctp = null;
    if (browserDetails.browser === "chrome" && browserDetails.version >= 76) {
      const { sdpSemantics } = this.getConfiguration();
      if (sdpSemantics === "plan-b") {
        Object.defineProperty(this, "sctp", {
          get() {
            return typeof this._sctp === "undefined" ? null : this._sctp;
          },
          enumerable: true,
          configurable: true
        });
      }
    }
    if (sctpInDescription(arguments[0])) {
      const isFirefox = getRemoteFirefoxVersion(arguments[0]);
      const canSendMMS = getCanSendMaxMessageSize(isFirefox);
      const remoteMMS = getMaxMessageSize(arguments[0], isFirefox);
      let maxMessageSize;
      if (canSendMMS === 0 && remoteMMS === 0) {
        maxMessageSize = Number.POSITIVE_INFINITY;
      } else if (canSendMMS === 0 || remoteMMS === 0) {
        maxMessageSize = Math.max(canSendMMS, remoteMMS);
      } else {
        maxMessageSize = Math.min(canSendMMS, remoteMMS);
      }
      const sctp = {};
      Object.defineProperty(sctp, "maxMessageSize", {
        get() {
          return maxMessageSize;
        }
      });
      this._sctp = sctp;
    }
    return origSetRemoteDescription.apply(this, arguments);
  };
}
function shimSendThrowTypeError(window2) {
  if (!(window2.RTCPeerConnection && "createDataChannel" in window2.RTCPeerConnection.prototype)) {
    return;
  }
  function wrapDcSend(dc, pc) {
    const origDataChannelSend = dc.send;
    dc.send = function send() {
      const data = arguments[0];
      const length = data.length || data.size || data.byteLength;
      if (dc.readyState === "open" && pc.sctp && length > pc.sctp.maxMessageSize) {
        throw new TypeError("Message too large (can send a maximum of " + pc.sctp.maxMessageSize + " bytes)");
      }
      return origDataChannelSend.apply(dc, arguments);
    };
  }
  const origCreateDataChannel = window2.RTCPeerConnection.prototype.createDataChannel;
  window2.RTCPeerConnection.prototype.createDataChannel = function createDataChannel() {
    const dataChannel = origCreateDataChannel.apply(this, arguments);
    wrapDcSend(dataChannel, this);
    return dataChannel;
  };
  wrapPeerConnectionEvent(window2, "datachannel", (e3) => {
    wrapDcSend(e3.channel, e3.target);
    return e3;
  });
}
function shimConnectionState(window2) {
  if (!window2.RTCPeerConnection || "connectionState" in window2.RTCPeerConnection.prototype) {
    return;
  }
  const proto = window2.RTCPeerConnection.prototype;
  Object.defineProperty(proto, "connectionState", {
    get() {
      return {
        completed: "connected",
        checking: "connecting"
      }[this.iceConnectionState] || this.iceConnectionState;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(proto, "onconnectionstatechange", {
    get() {
      return this._onconnectionstatechange || null;
    },
    set(cb) {
      if (this._onconnectionstatechange) {
        this.removeEventListener(
          "connectionstatechange",
          this._onconnectionstatechange
        );
        delete this._onconnectionstatechange;
      }
      if (cb) {
        this.addEventListener(
          "connectionstatechange",
          this._onconnectionstatechange = cb
        );
      }
    },
    enumerable: true,
    configurable: true
  });
  ["setLocalDescription", "setRemoteDescription"].forEach((method) => {
    const origMethod = proto[method];
    proto[method] = function() {
      if (!this._connectionstatechangepoly) {
        this._connectionstatechangepoly = (e3) => {
          const pc = e3.target;
          if (pc._lastConnectionState !== pc.connectionState) {
            pc._lastConnectionState = pc.connectionState;
            const newEvent = new Event("connectionstatechange", e3);
            pc.dispatchEvent(newEvent);
          }
          return e3;
        };
        this.addEventListener(
          "iceconnectionstatechange",
          this._connectionstatechangepoly
        );
      }
      return origMethod.apply(this, arguments);
    };
  });
}
function removeExtmapAllowMixed(window2, browserDetails) {
  if (!window2.RTCPeerConnection) {
    return;
  }
  if (browserDetails.browser === "chrome" && browserDetails.version >= 71) {
    return;
  }
  if (browserDetails.browser === "safari" && browserDetails._safariVersion >= 13.1) {
    return;
  }
  const nativeSRD = window2.RTCPeerConnection.prototype.setRemoteDescription;
  window2.RTCPeerConnection.prototype.setRemoteDescription = function setRemoteDescription(desc) {
    if (desc && desc.sdp && desc.sdp.indexOf("\na=extmap-allow-mixed") !== -1) {
      const sdp2 = desc.sdp.split("\n").filter((line) => {
        return line.trim() !== "a=extmap-allow-mixed";
      }).join("\n");
      if (window2.RTCSessionDescription && desc instanceof window2.RTCSessionDescription) {
        arguments[0] = new window2.RTCSessionDescription({
          type: desc.type,
          sdp: sdp2
        });
      } else {
        desc.sdp = sdp2;
      }
    }
    return nativeSRD.apply(this, arguments);
  };
}
function shimAddIceCandidateNullOrEmpty(window2, browserDetails) {
  if (!(window2.RTCPeerConnection && window2.RTCPeerConnection.prototype)) {
    return;
  }
  const nativeAddIceCandidate = window2.RTCPeerConnection.prototype.addIceCandidate;
  if (!nativeAddIceCandidate || nativeAddIceCandidate.length === 0) {
    return;
  }
  window2.RTCPeerConnection.prototype.addIceCandidate = function addIceCandidate() {
    if (!arguments[0]) {
      if (arguments[1]) {
        arguments[1].apply(null);
      }
      return Promise.resolve();
    }
    if ((browserDetails.browser === "chrome" && browserDetails.version < 78 || browserDetails.browser === "firefox" && browserDetails.version < 68 || browserDetails.browser === "safari") && arguments[0] && arguments[0].candidate === "") {
      return Promise.resolve();
    }
    return nativeAddIceCandidate.apply(this, arguments);
  };
}
function shimParameterlessSetLocalDescription(window2, browserDetails) {
  if (!(window2.RTCPeerConnection && window2.RTCPeerConnection.prototype)) {
    return;
  }
  const nativeSetLocalDescription = window2.RTCPeerConnection.prototype.setLocalDescription;
  if (!nativeSetLocalDescription || nativeSetLocalDescription.length === 0) {
    return;
  }
  window2.RTCPeerConnection.prototype.setLocalDescription = function setLocalDescription() {
    let desc = arguments[0] || {};
    if (typeof desc !== "object" || desc.type && desc.sdp) {
      return nativeSetLocalDescription.apply(this, arguments);
    }
    desc = { type: desc.type, sdp: desc.sdp };
    if (!desc.type) {
      switch (this.signalingState) {
        case "stable":
        case "have-local-offer":
        case "have-remote-pranswer":
          desc.type = "offer";
          break;
        default:
          desc.type = "answer";
          break;
      }
    }
    if (desc.sdp || desc.type !== "offer" && desc.type !== "answer") {
      return nativeSetLocalDescription.apply(this, [desc]);
    }
    const func = desc.type === "offer" ? this.createOffer : this.createAnswer;
    return func.apply(this).then((d2) => nativeSetLocalDescription.apply(this, [d2]));
  };
}

// node_modules/webrtc-adapter/src/js/adapter_factory.js
var sdp = __toESM(require_sdp());
function adapterFactory({ window: window2 } = {}, options = {
  shimChrome: true,
  shimFirefox: true,
  shimSafari: true
}) {
  const logging2 = log;
  const browserDetails = detectBrowser(window2);
  const adapter2 = {
    browserDetails,
    commonShim: common_shim_exports,
    extractVersion,
    disableLog,
    disableWarnings,
    // Expose sdp as a convenience. For production apps include directly.
    sdp
  };
  switch (browserDetails.browser) {
    case "chrome":
      if (!chrome_shim_exports || !shimPeerConnection || !options.shimChrome) {
        logging2("Chrome shim is not included in this adapter release.");
        return adapter2;
      }
      if (browserDetails.version === null) {
        logging2("Chrome shim can not determine version, not shimming.");
        return adapter2;
      }
      logging2("adapter.js shimming chrome.");
      adapter2.browserShim = chrome_shim_exports;
      shimAddIceCandidateNullOrEmpty(window2, browserDetails);
      shimParameterlessSetLocalDescription(window2, browserDetails);
      shimGetUserMedia(window2, browserDetails);
      shimMediaStream(window2, browserDetails);
      shimPeerConnection(window2, browserDetails);
      shimOnTrack(window2, browserDetails);
      shimAddTrackRemoveTrack(window2, browserDetails);
      shimGetSendersWithDtmf(window2, browserDetails);
      shimSenderReceiverGetStats(window2, browserDetails);
      fixNegotiationNeeded(window2, browserDetails);
      shimRTCIceCandidate(window2, browserDetails);
      shimRTCIceCandidateRelayProtocol(window2, browserDetails);
      shimConnectionState(window2, browserDetails);
      shimMaxMessageSize(window2, browserDetails);
      shimSendThrowTypeError(window2, browserDetails);
      removeExtmapAllowMixed(window2, browserDetails);
      break;
    case "firefox":
      if (!firefox_shim_exports || !shimPeerConnection2 || !options.shimFirefox) {
        logging2("Firefox shim is not included in this adapter release.");
        return adapter2;
      }
      logging2("adapter.js shimming firefox.");
      adapter2.browserShim = firefox_shim_exports;
      shimAddIceCandidateNullOrEmpty(window2, browserDetails);
      shimParameterlessSetLocalDescription(window2, browserDetails);
      shimGetUserMedia2(window2, browserDetails);
      shimPeerConnection2(window2, browserDetails);
      shimOnTrack2(window2, browserDetails);
      shimRemoveStream(window2, browserDetails);
      shimSenderGetStats(window2, browserDetails);
      shimReceiverGetStats(window2, browserDetails);
      shimRTCDataChannel(window2, browserDetails);
      shimAddTransceiver(window2, browserDetails);
      shimGetParameters(window2, browserDetails);
      shimCreateOffer(window2, browserDetails);
      shimCreateAnswer(window2, browserDetails);
      shimRTCIceCandidate(window2, browserDetails);
      shimConnectionState(window2, browserDetails);
      shimMaxMessageSize(window2, browserDetails);
      shimSendThrowTypeError(window2, browserDetails);
      break;
    case "safari":
      if (!safari_shim_exports || !options.shimSafari) {
        logging2("Safari shim is not included in this adapter release.");
        return adapter2;
      }
      logging2("adapter.js shimming safari.");
      adapter2.browserShim = safari_shim_exports;
      shimAddIceCandidateNullOrEmpty(window2, browserDetails);
      shimParameterlessSetLocalDescription(window2, browserDetails);
      shimRTCIceServerUrls(window2, browserDetails);
      shimCreateOfferLegacy(window2, browserDetails);
      shimCallbacksAPI(window2, browserDetails);
      shimLocalStreamsAPI(window2, browserDetails);
      shimRemoteStreamsAPI(window2, browserDetails);
      shimTrackEventTransceiver(window2, browserDetails);
      shimGetUserMedia3(window2, browserDetails);
      shimAudioContext(window2, browserDetails);
      shimRTCIceCandidate(window2, browserDetails);
      shimRTCIceCandidateRelayProtocol(window2, browserDetails);
      shimMaxMessageSize(window2, browserDetails);
      shimSendThrowTypeError(window2, browserDetails);
      removeExtmapAllowMixed(window2, browserDetails);
      break;
    default:
      logging2("Unsupported browser!");
      break;
  }
  return adapter2;
}

// node_modules/webrtc-adapter/src/js/adapter_core.js
var adapter = adapterFactory({ window: typeof window === "undefined" ? void 0 : window });

// node_modules/barcode-detector/dist/es/ponyfill.js
var Ae = (o2) => {
  throw TypeError(o2);
};
var Se = (o2, f2, c2) => f2.has(o2) || Ae("Cannot " + c2);
var Ie = (o2, f2, c2) => (Se(o2, f2, "read from private field"), c2 ? c2.call(o2) : f2.get(o2));
var De = (o2, f2, c2) => f2.has(o2) ? Ae("Cannot add the same private member more than once") : f2 instanceof WeakSet ? f2.add(o2) : f2.set(o2, c2);
var Me = (o2, f2, c2, T2) => (Se(o2, f2, "write to private field"), T2 ? T2.call(o2, c2) : f2.set(o2, c2), c2);
var Dt = [
  ["Aztec", "M"],
  ["Codabar", "L"],
  ["Code39", "L"],
  ["Code93", "L"],
  ["Code128", "L"],
  ["DataBar", "L"],
  ["DataBarExpanded", "L"],
  ["DataMatrix", "M"],
  ["EAN-8", "L"],
  ["EAN-13", "L"],
  ["ITF", "L"],
  ["MaxiCode", "M"],
  ["PDF417", "M"],
  ["QRCode", "M"],
  ["UPC-A", "L"],
  ["UPC-E", "L"],
  ["MicroQRCode", "M"],
  ["rMQRCode", "M"],
  ["DXFilmEdge", "L"],
  ["DataBarLimited", "L"]
];
var Mt = Dt.map(([o2]) => o2);
var La = Mt.filter(
  (o2, f2) => Dt[f2][1] === "L"
);
var Ba = Mt.filter(
  (o2, f2) => Dt[f2][1] === "M"
);
function Yt(o2) {
  switch (o2) {
    case "Linear-Codes":
      return La.reduce((f2, c2) => f2 | Yt(c2), 0);
    case "Matrix-Codes":
      return Ba.reduce((f2, c2) => f2 | Yt(c2), 0);
    case "Any":
      return (1 << Dt.length) - 1;
    case "None":
      return 0;
    default:
      return 1 << Mt.indexOf(o2);
  }
}
function Wa(o2) {
  if (o2 === 0)
    return "None";
  const f2 = 31 - Math.clz32(o2);
  return Mt[f2];
}
function Ua(o2) {
  return o2.reduce((f2, c2) => f2 | Yt(c2), 0);
}
var Va = [
  "LocalAverage",
  "GlobalHistogram",
  "FixedThreshold",
  "BoolCast"
];
function ka(o2) {
  return Va.indexOf(o2);
}
var Fe = [
  "Unknown",
  "ASCII",
  "ISO8859_1",
  "ISO8859_2",
  "ISO8859_3",
  "ISO8859_4",
  "ISO8859_5",
  "ISO8859_6",
  "ISO8859_7",
  "ISO8859_8",
  "ISO8859_9",
  "ISO8859_10",
  "ISO8859_11",
  "ISO8859_13",
  "ISO8859_14",
  "ISO8859_15",
  "ISO8859_16",
  "Cp437",
  "Cp1250",
  "Cp1251",
  "Cp1252",
  "Cp1256",
  "Shift_JIS",
  "Big5",
  "GB2312",
  "GB18030",
  "EUC_JP",
  "EUC_KR",
  "UTF16BE",
  /**
   * UnicodeBig [[deprecated]]
   */
  "UTF16BE",
  "UTF8",
  "UTF16LE",
  "UTF32BE",
  "UTF32LE",
  "BINARY"
];
function Ha(o2) {
  return o2 === "UnicodeBig" ? Fe.indexOf("UTF16BE") : Fe.indexOf(o2);
}
var Na = [
  "Text",
  "Binary",
  "Mixed",
  "GS1",
  "ISO15434",
  "UnknownECI"
];
function za(o2) {
  return Na[o2];
}
var Ga = ["Ignore", "Read", "Require"];
function Xa(o2) {
  return Ga.indexOf(o2);
}
var qa = ["Plain", "ECI", "HRI", "Hex", "Escaped"];
function Ya(o2) {
  return qa.indexOf(o2);
}
var It = {
  formats: [],
  tryHarder: true,
  tryRotate: true,
  tryInvert: true,
  tryDownscale: true,
  tryDenoise: false,
  binarizer: "LocalAverage",
  isPure: false,
  downscaleFactor: 3,
  downscaleThreshold: 500,
  minLineCount: 2,
  maxNumberOfSymbols: 255,
  tryCode39ExtendedMode: true,
  returnErrors: false,
  eanAddOnSymbol: "Ignore",
  textMode: "HRI",
  characterSet: "Unknown"
};
function je(o2) {
  return {
    ...o2,
    formats: Ua(o2.formats),
    binarizer: ka(o2.binarizer),
    eanAddOnSymbol: Xa(o2.eanAddOnSymbol),
    textMode: Ya(o2.textMode),
    characterSet: Ha(o2.characterSet)
  };
}
function Za(o2) {
  return {
    ...o2,
    format: Wa(o2.format),
    contentType: za(o2.contentType),
    eccLevel: o2.ecLevel
  };
}
var Qa = {
  locateFile: (o2, f2) => {
    const c2 = o2.match(/_(.+?)\.wasm$/);
    return c2 ? `https://fastly.jsdelivr.net/npm/zxing-wasm@2.1.2/dist/${c2[1]}/${o2}` : f2 + o2;
  }
};
var St = /* @__PURE__ */ new WeakMap();
function Ja(o2, f2) {
  return Object.is(o2, f2) || Object.keys(o2).length === Object.keys(f2).length && Object.keys(o2).every(
    (c2) => Object.prototype.hasOwnProperty.call(f2, c2) && o2[c2] === f2[c2]
  );
}
function Le(o2, {
  overrides: f2,
  equalityFn: c2 = Ja,
  fireImmediately: T2 = false
} = {}) {
  var $;
  const [x, D2] = ($ = St.get(o2)) != null ? $ : [Qa], R2 = f2 != null ? f2 : x;
  let O;
  if (T2) {
    if (D2 && (O = c2(x, R2)))
      return D2;
    const M2 = o2({
      ...R2
    });
    return St.set(o2, [R2, M2]), M2;
  }
  (O != null ? O : c2(x, R2)) || St.set(o2, [R2]);
}
async function to(o2, f2, c2 = It) {
  const T2 = {
    ...It,
    ...c2
  }, $ = await Le(o2, {
    fireImmediately: true
  });
  let x, D2;
  if ("width" in f2 && "height" in f2 && "data" in f2) {
    const {
      data: O,
      data: { byteLength: M2 },
      width: F2,
      height: q2
    } = f2;
    D2 = $._malloc(M2), $.HEAPU8.set(O, D2), x = $.readBarcodesFromPixmap(
      D2,
      F2,
      q2,
      je(T2)
    );
  } else {
    let O, M2;
    if ("buffer" in f2)
      [O, M2] = [f2.byteLength, f2];
    else if ("byteLength" in f2)
      [O, M2] = [f2.byteLength, new Uint8Array(f2)];
    else if ("size" in f2)
      [O, M2] = [f2.size, new Uint8Array(await f2.arrayBuffer())];
    else
      throw new TypeError("Invalid input type");
    D2 = $._malloc(O), $.HEAPU8.set(M2, D2), x = $.readBarcodesFromImage(
      D2,
      O,
      je(T2)
    );
  }
  $._free(D2);
  const R2 = [];
  for (let O = 0; O < x.size(); ++O)
    R2.push(
      Za(x.get(O))
    );
  return R2;
}
({
  ...It,
  formats: [...It.formats]
});
var Qt = async function(o2 = {}) {
  var f2, c2 = o2, T2, $, x = new Promise((e3, t2) => {
    T2 = e3, $ = t2;
  }), D2 = typeof window == "object", R2 = typeof Bun < "u", O = typeof WorkerGlobalScope < "u";
  typeof process == "object" && typeof process.versions == "object" && typeof process.versions.node == "string" && process.type != "renderer";
  var M2 = "./this.program", F2 = "";
  function q2(e3) {
    return c2.locateFile ? c2.locateFile(e3, F2) : F2 + e3;
  }
  var rt, Y2;
  (D2 || O || R2) && (O ? F2 = self.location.href : typeof document < "u" && document.currentScript && (F2 = document.currentScript.src), F2.startsWith("blob:") ? F2 = "" : F2 = F2.slice(0, F2.replace(/[?#].*/, "").lastIndexOf("/") + 1), O && (Y2 = (e3) => {
    var t2 = new XMLHttpRequest();
    return t2.open("GET", e3, false), t2.responseType = "arraybuffer", t2.send(null), new Uint8Array(t2.response);
  }), rt = async (e3) => {
    var t2 = await fetch(e3, {
      credentials: "same-origin"
    });
    if (t2.ok)
      return t2.arrayBuffer();
    throw new Error(t2.status + " : " + t2.url);
  });
  var st = console.log.bind(console), k2 = console.error.bind(console), Z, nt, Jt = false, Q2, B2, ut, vt, at, P, Kt, te;
  function ee() {
    var e3 = nt.buffer;
    Q2 = new Int8Array(e3), ut = new Int16Array(e3), c2.HEAPU8 = B2 = new Uint8Array(e3), vt = new Uint16Array(e3), at = new Int32Array(e3), P = new Uint32Array(e3), Kt = new Float32Array(e3), te = new Float64Array(e3);
  }
  function qe() {
    if (c2.preRun)
      for (typeof c2.preRun == "function" && (c2.preRun = [c2.preRun]); c2.preRun.length; )
        sr(c2.preRun.shift());
    re(ae);
  }
  function Ye() {
    E2.ya();
  }
  function Ze() {
    if (c2.postRun)
      for (typeof c2.postRun == "function" && (c2.postRun = [c2.postRun]); c2.postRun.length; )
        ir(c2.postRun.shift());
    re(ne);
  }
  var J = 0, ct = null;
  function Qe(e3) {
    var t2;
    J++, (t2 = c2.monitorRunDependencies) === null || t2 === void 0 || t2.call(c2, J);
  }
  function Je(e3) {
    var t2;
    if (J--, (t2 = c2.monitorRunDependencies) === null || t2 === void 0 || t2.call(c2, J), J == 0 && ct) {
      var r2 = ct;
      ct = null, r2();
    }
  }
  function Ft(e3) {
    var t2;
    (t2 = c2.onAbort) === null || t2 === void 0 || t2.call(c2, e3), e3 = "Aborted(" + e3 + ")", k2(e3), Jt = true, e3 += ". Build with -sASSERTIONS for more info.";
    var r2 = new WebAssembly.RuntimeError(e3);
    throw $(r2), r2;
  }
  var yt;
  function Ke() {
    return q2("zxing_reader.wasm");
  }
  function tr(e3) {
    if (e3 == yt && Z)
      return new Uint8Array(Z);
    if (Y2)
      return Y2(e3);
    throw "both async and sync fetching of the wasm failed";
  }
  async function er(e3) {
    if (!Z)
      try {
        var t2 = await rt(e3);
        return new Uint8Array(t2);
      } catch {
      }
    return tr(e3);
  }
  async function rr(e3, t2) {
    try {
      var r2 = await er(e3), n = await WebAssembly.instantiate(r2, t2);
      return n;
    } catch (a2) {
      k2(`failed to asynchronously prepare wasm: ${a2}`), Ft(a2);
    }
  }
  async function nr(e3, t2, r2) {
    if (!e3 && typeof WebAssembly.instantiateStreaming == "function")
      try {
        var n = fetch(t2, {
          credentials: "same-origin"
        }), a2 = await WebAssembly.instantiateStreaming(n, r2);
        return a2;
      } catch (i2) {
        k2(`wasm streaming compile failed: ${i2}`), k2("falling back to ArrayBuffer instantiation");
      }
    return rr(t2, r2);
  }
  function ar() {
    return {
      a: Hn
    };
  }
  async function or() {
    function e3(i2, u2) {
      return E2 = i2.exports, nt = E2.xa, ee(), pe = E2.Ba, Je(), E2;
    }
    Qe();
    function t2(i2) {
      return e3(i2.instance);
    }
    var r2 = ar();
    if (c2.instantiateWasm)
      return new Promise((i2, u2) => {
        c2.instantiateWasm(r2, (s2, l2) => {
          i2(e3(s2));
        });
      });
    yt != null || (yt = Ke());
    try {
      var n = await nr(Z, yt, r2), a2 = t2(n);
      return a2;
    } catch (i2) {
      return $(i2), Promise.reject(i2);
    }
  }
  var re = (e3) => {
    for (; e3.length > 0; )
      e3.shift()(c2);
  }, ne = [], ir = (e3) => ne.push(e3), ae = [], sr = (e3) => ae.push(e3), y = (e3) => Xn(e3), m2 = () => qn(), mt = [], gt = 0, ur = (e3) => {
    var t2 = new jt(e3);
    return t2.get_caught() || (t2.set_caught(true), gt--), t2.set_rethrown(false), mt.push(t2), Zn(e3), zn(e3);
  }, H = 0, cr = () => {
    v(0, 0);
    var e3 = mt.pop();
    Yn(e3.excPtr), H = 0;
  };
  class jt {
    constructor(t2) {
      this.excPtr = t2, this.ptr = t2 - 24;
    }
    set_type(t2) {
      P[this.ptr + 4 >> 2] = t2;
    }
    get_type() {
      return P[this.ptr + 4 >> 2];
    }
    set_destructor(t2) {
      P[this.ptr + 8 >> 2] = t2;
    }
    get_destructor() {
      return P[this.ptr + 8 >> 2];
    }
    set_caught(t2) {
      t2 = t2 ? 1 : 0, Q2[this.ptr + 12] = t2;
    }
    get_caught() {
      return Q2[this.ptr + 12] != 0;
    }
    set_rethrown(t2) {
      t2 = t2 ? 1 : 0, Q2[this.ptr + 13] = t2;
    }
    get_rethrown() {
      return Q2[this.ptr + 13] != 0;
    }
    init(t2, r2) {
      this.set_adjusted_ptr(0), this.set_type(t2), this.set_destructor(r2);
    }
    set_adjusted_ptr(t2) {
      P[this.ptr + 16 >> 2] = t2;
    }
    get_adjusted_ptr() {
      return P[this.ptr + 16 >> 2];
    }
  }
  var wt = (e3) => Gn(e3), Rt = (e3) => {
    var t2 = H;
    if (!t2)
      return wt(0), 0;
    var r2 = new jt(t2);
    r2.set_adjusted_ptr(t2);
    var n = r2.get_type();
    if (!n)
      return wt(0), t2;
    for (var a2 of e3) {
      if (a2 === 0 || a2 === n)
        break;
      var i2 = r2.ptr + 16;
      if (Qn(a2, n, i2))
        return wt(a2), t2;
    }
    return wt(n), t2;
  }, lr = () => Rt([]), fr = (e3) => Rt([e3]), dr = (e3, t2) => Rt([e3, t2]), hr = () => {
    var e3 = mt.pop();
    e3 || Ft("no exception to throw");
    var t2 = e3.excPtr;
    throw e3.get_rethrown() || (mt.push(e3), e3.set_rethrown(true), e3.set_caught(false), gt++), H = t2, H;
  }, pr = (e3, t2, r2) => {
    var n = new jt(e3);
    throw n.init(t2, r2), H = e3, gt++, H;
  }, vr = () => gt, yr = (e3) => {
    throw H || (H = e3), H;
  }, mr = () => Ft(""), $t = {}, Lt = (e3) => {
    for (; e3.length; ) {
      var t2 = e3.pop(), r2 = e3.pop();
      r2(t2);
    }
  };
  function lt(e3) {
    return this.fromWireType(P[e3 >> 2]);
  }
  var ot = {}, K2 = {}, bt = {}, gr = c2.InternalError = class extends Error {
    constructor(e3) {
      super(e3), this.name = "InternalError";
    }
  }, Ct = (e3) => {
    throw new gr(e3);
  }, tt = (e3, t2, r2) => {
    e3.forEach((s2) => bt[s2] = t2);
    function n(s2) {
      var l2 = r2(s2);
      l2.length !== e3.length && Ct("Mismatched type converter count");
      for (var d2 = 0; d2 < e3.length; ++d2)
        V2(e3[d2], l2[d2]);
    }
    var a2 = new Array(t2.length), i2 = [], u2 = 0;
    t2.forEach((s2, l2) => {
      K2.hasOwnProperty(s2) ? a2[l2] = K2[s2] : (i2.push(s2), ot.hasOwnProperty(s2) || (ot[s2] = []), ot[s2].push(() => {
        a2[l2] = K2[s2], ++u2, u2 === i2.length && n(a2);
      }));
    }), i2.length === 0 && n(a2);
  }, wr = (e3) => {
    var t2 = $t[e3];
    delete $t[e3];
    var r2 = t2.rawConstructor, n = t2.rawDestructor, a2 = t2.fields, i2 = a2.map((u2) => u2.getterReturnType).concat(a2.map((u2) => u2.setterArgumentType));
    tt([e3], i2, (u2) => {
      var s2 = {};
      return a2.forEach((l2, d2) => {
        var h2 = l2.fieldName, p2 = u2[d2], w2 = u2[d2].optional, b = l2.getter, _ = l2.getterContext, S = u2[d2 + a2.length], A2 = l2.setter, I2 = l2.setterContext;
        s2[h2] = {
          read: (X) => p2.fromWireType(b(_, X)),
          write: (X, L) => {
            var W = [];
            A2(I2, X, S.toWireType(W, L)), Lt(W);
          },
          optional: w2
        };
      }), [{
        name: t2.name,
        fromWireType: (l2) => {
          var d2 = {};
          for (var h2 in s2)
            d2[h2] = s2[h2].read(l2);
          return n(l2), d2;
        },
        toWireType: (l2, d2) => {
          for (var h2 in s2)
            if (!(h2 in d2) && !s2[h2].optional)
              throw new TypeError(`Missing field: "${h2}"`);
          var p2 = r2();
          for (h2 in s2)
            s2[h2].write(p2, d2[h2]);
          return l2 !== null && l2.push(n, p2), p2;
        },
        argPackAdvance: N2,
        readValueFromPointer: lt,
        destructorFunction: n
      }];
    });
  }, $r = (e3, t2, r2, n, a2) => {
  }, br = () => {
    for (var e3 = new Array(256), t2 = 0; t2 < 256; ++t2)
      e3[t2] = String.fromCharCode(t2);
    oe = e3;
  }, oe, j = (e3) => {
    for (var t2 = "", r2 = e3; B2[r2]; )
      t2 += oe[B2[r2++]];
    return t2;
  }, ft = c2.BindingError = class extends Error {
    constructor(e3) {
      super(e3), this.name = "BindingError";
    }
  }, C2 = (e3) => {
    throw new ft(e3);
  };
  function Cr(e3, t2) {
    let r2 = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
    var n = t2.name;
    if (e3 || C2(`type "${n}" must have a positive integer typeid pointer`), K2.hasOwnProperty(e3)) {
      if (r2.ignoreDuplicateRegistrations)
        return;
      C2(`Cannot register type '${n}' twice`);
    }
    if (K2[e3] = t2, delete bt[e3], ot.hasOwnProperty(e3)) {
      var a2 = ot[e3];
      delete ot[e3], a2.forEach((i2) => i2());
    }
  }
  function V2(e3, t2) {
    let r2 = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
    return Cr(e3, t2, r2);
  }
  var N2 = 8, Tr = (e3, t2, r2, n) => {
    t2 = j(t2), V2(e3, {
      name: t2,
      fromWireType: function(a2) {
        return !!a2;
      },
      toWireType: function(a2, i2) {
        return i2 ? r2 : n;
      },
      argPackAdvance: N2,
      readValueFromPointer: function(a2) {
        return this.fromWireType(B2[a2]);
      },
      destructorFunction: null
    });
  }, Pr = (e3) => ({
    count: e3.count,
    deleteScheduled: e3.deleteScheduled,
    preservePointerOnDelete: e3.preservePointerOnDelete,
    ptr: e3.ptr,
    ptrType: e3.ptrType,
    smartPtr: e3.smartPtr,
    smartPtrType: e3.smartPtrType
  }), Bt = (e3) => {
    function t2(r2) {
      return r2.$$.ptrType.registeredClass.name;
    }
    C2(t2(e3) + " instance already deleted");
  }, Wt = false, ie = (e3) => {
  }, Er = (e3) => {
    e3.smartPtr ? e3.smartPtrType.rawDestructor(e3.smartPtr) : e3.ptrType.registeredClass.rawDestructor(e3.ptr);
  }, se = (e3) => {
    e3.count.value -= 1;
    var t2 = e3.count.value === 0;
    t2 && Er(e3);
  }, dt = (e3) => typeof FinalizationRegistry > "u" ? (dt = (t2) => t2, e3) : (Wt = new FinalizationRegistry((t2) => {
    se(t2.$$);
  }), dt = (t2) => {
    var r2 = t2.$$, n = !!r2.smartPtr;
    if (n) {
      var a2 = {
        $$: r2
      };
      Wt.register(t2, a2, t2);
    }
    return t2;
  }, ie = (t2) => Wt.unregister(t2), dt(e3)), _r = () => {
    let e3 = Tt.prototype;
    Object.assign(e3, {
      isAliasOf(r2) {
        if (!(this instanceof Tt) || !(r2 instanceof Tt))
          return false;
        var n = this.$$.ptrType.registeredClass, a2 = this.$$.ptr;
        r2.$$ = r2.$$;
        for (var i2 = r2.$$.ptrType.registeredClass, u2 = r2.$$.ptr; n.baseClass; )
          a2 = n.upcast(a2), n = n.baseClass;
        for (; i2.baseClass; )
          u2 = i2.upcast(u2), i2 = i2.baseClass;
        return n === i2 && a2 === u2;
      },
      clone() {
        if (this.$$.ptr || Bt(this), this.$$.preservePointerOnDelete)
          return this.$$.count.value += 1, this;
        var r2 = dt(Object.create(Object.getPrototypeOf(this), {
          $$: {
            value: Pr(this.$$)
          }
        }));
        return r2.$$.count.value += 1, r2.$$.deleteScheduled = false, r2;
      },
      delete() {
        this.$$.ptr || Bt(this), this.$$.deleteScheduled && !this.$$.preservePointerOnDelete && C2("Object already scheduled for deletion"), ie(this), se(this.$$), this.$$.preservePointerOnDelete || (this.$$.smartPtr = void 0, this.$$.ptr = void 0);
      },
      isDeleted() {
        return !this.$$.ptr;
      },
      deleteLater() {
        return this.$$.ptr || Bt(this), this.$$.deleteScheduled && !this.$$.preservePointerOnDelete && C2("Object already scheduled for deletion"), this.$$.deleteScheduled = true, this;
      }
    });
    const t2 = Symbol.dispose;
    t2 && (e3[t2] = e3.delete);
  };
  function Tt() {
  }
  var Ut = (e3, t2) => Object.defineProperty(t2, "name", {
    value: e3
  }), ue = {}, ce = (e3, t2, r2) => {
    if (e3[t2].overloadTable === void 0) {
      var n = e3[t2];
      e3[t2] = function() {
        for (var a2 = arguments.length, i2 = new Array(a2), u2 = 0; u2 < a2; u2++)
          i2[u2] = arguments[u2];
        return e3[t2].overloadTable.hasOwnProperty(i2.length) || C2(`Function '${r2}' called with an invalid number of arguments (${i2.length}) - expects one of (${e3[t2].overloadTable})!`), e3[t2].overloadTable[i2.length].apply(this, i2);
      }, e3[t2].overloadTable = [], e3[t2].overloadTable[n.argCount] = n;
    }
  }, le = (e3, t2, r2) => {
    c2.hasOwnProperty(e3) ? ((r2 === void 0 || c2[e3].overloadTable !== void 0 && c2[e3].overloadTable[r2] !== void 0) && C2(`Cannot register public name '${e3}' twice`), ce(c2, e3, e3), c2[e3].overloadTable.hasOwnProperty(r2) && C2(`Cannot register multiple overloads of a function with the same number of arguments (${r2})!`), c2[e3].overloadTable[r2] = t2) : (c2[e3] = t2, c2[e3].argCount = r2);
  }, Or = 48, xr = 57, Ar = (e3) => {
    e3 = e3.replace(/[^a-zA-Z0-9_]/g, "$");
    var t2 = e3.charCodeAt(0);
    return t2 >= Or && t2 <= xr ? `_${e3}` : e3;
  };
  function Sr(e3, t2, r2, n, a2, i2, u2, s2) {
    this.name = e3, this.constructor = t2, this.instancePrototype = r2, this.rawDestructor = n, this.baseClass = a2, this.getActualType = i2, this.upcast = u2, this.downcast = s2, this.pureVirtualFunctions = [];
  }
  var Vt = (e3, t2, r2) => {
    for (; t2 !== r2; )
      t2.upcast || C2(`Expected null or instance of ${r2.name}, got an instance of ${t2.name}`), e3 = t2.upcast(e3), t2 = t2.baseClass;
    return e3;
  };
  function Ir(e3, t2) {
    if (t2 === null)
      return this.isReference && C2(`null is not a valid ${this.name}`), 0;
    t2.$$ || C2(`Cannot pass "${embindRepr(t2)}" as a ${this.name}`), t2.$$.ptr || C2(`Cannot pass deleted object as a pointer of type ${this.name}`);
    var r2 = t2.$$.ptrType.registeredClass, n = Vt(t2.$$.ptr, r2, this.registeredClass);
    return n;
  }
  function Dr(e3, t2) {
    var r2;
    if (t2 === null)
      return this.isReference && C2(`null is not a valid ${this.name}`), this.isSmartPointer ? (r2 = this.rawConstructor(), e3 !== null && e3.push(this.rawDestructor, r2), r2) : 0;
    (!t2 || !t2.$$) && C2(`Cannot pass "${embindRepr(t2)}" as a ${this.name}`), t2.$$.ptr || C2(`Cannot pass deleted object as a pointer of type ${this.name}`), !this.isConst && t2.$$.ptrType.isConst && C2(`Cannot convert argument of type ${t2.$$.smartPtrType ? t2.$$.smartPtrType.name : t2.$$.ptrType.name} to parameter type ${this.name}`);
    var n = t2.$$.ptrType.registeredClass;
    if (r2 = Vt(t2.$$.ptr, n, this.registeredClass), this.isSmartPointer)
      switch (t2.$$.smartPtr === void 0 && C2("Passing raw pointer to smart pointer is illegal"), this.sharingPolicy) {
        case 0:
          t2.$$.smartPtrType === this ? r2 = t2.$$.smartPtr : C2(`Cannot convert argument of type ${t2.$$.smartPtrType ? t2.$$.smartPtrType.name : t2.$$.ptrType.name} to parameter type ${this.name}`);
          break;
        case 1:
          r2 = t2.$$.smartPtr;
          break;
        case 2:
          if (t2.$$.smartPtrType === this)
            r2 = t2.$$.smartPtr;
          else {
            var a2 = t2.clone();
            r2 = this.rawShare(r2, G2.toHandle(() => a2.delete())), e3 !== null && e3.push(this.rawDestructor, r2);
          }
          break;
        default:
          C2("Unsupporting sharing policy");
      }
    return r2;
  }
  function Mr(e3, t2) {
    if (t2 === null)
      return this.isReference && C2(`null is not a valid ${this.name}`), 0;
    t2.$$ || C2(`Cannot pass "${embindRepr(t2)}" as a ${this.name}`), t2.$$.ptr || C2(`Cannot pass deleted object as a pointer of type ${this.name}`), t2.$$.ptrType.isConst && C2(`Cannot convert argument of type ${t2.$$.ptrType.name} to parameter type ${this.name}`);
    var r2 = t2.$$.ptrType.registeredClass, n = Vt(t2.$$.ptr, r2, this.registeredClass);
    return n;
  }
  var fe = (e3, t2, r2) => {
    if (t2 === r2)
      return e3;
    if (r2.baseClass === void 0)
      return null;
    var n = fe(e3, t2, r2.baseClass);
    return n === null ? null : r2.downcast(n);
  }, Fr = {}, jr = (e3, t2) => {
    for (t2 === void 0 && C2("ptr should not be undefined"); e3.baseClass; )
      t2 = e3.upcast(t2), e3 = e3.baseClass;
    return t2;
  }, Rr = (e3, t2) => (t2 = jr(e3, t2), Fr[t2]), Pt = (e3, t2) => {
    (!t2.ptrType || !t2.ptr) && Ct("makeClassHandle requires ptr and ptrType");
    var r2 = !!t2.smartPtrType, n = !!t2.smartPtr;
    return r2 !== n && Ct("Both smartPtrType and smartPtr must be specified"), t2.count = {
      value: 1
    }, dt(Object.create(e3, {
      $$: {
        value: t2,
        writable: true
      }
    }));
  };
  function Lr(e3) {
    var t2 = this.getPointee(e3);
    if (!t2)
      return this.destructor(e3), null;
    var r2 = Rr(this.registeredClass, t2);
    if (r2 !== void 0) {
      if (r2.$$.count.value === 0)
        return r2.$$.ptr = t2, r2.$$.smartPtr = e3, r2.clone();
      var n = r2.clone();
      return this.destructor(e3), n;
    }
    function a2() {
      return this.isSmartPointer ? Pt(this.registeredClass.instancePrototype, {
        ptrType: this.pointeeType,
        ptr: t2,
        smartPtrType: this,
        smartPtr: e3
      }) : Pt(this.registeredClass.instancePrototype, {
        ptrType: this,
        ptr: e3
      });
    }
    var i2 = this.registeredClass.getActualType(t2), u2 = ue[i2];
    if (!u2)
      return a2.call(this);
    var s2;
    this.isConst ? s2 = u2.constPointerType : s2 = u2.pointerType;
    var l2 = fe(t2, this.registeredClass, s2.registeredClass);
    return l2 === null ? a2.call(this) : this.isSmartPointer ? Pt(s2.registeredClass.instancePrototype, {
      ptrType: s2,
      ptr: l2,
      smartPtrType: this,
      smartPtr: e3
    }) : Pt(s2.registeredClass.instancePrototype, {
      ptrType: s2,
      ptr: l2
    });
  }
  var Br = () => {
    Object.assign(Et.prototype, {
      getPointee(e3) {
        return this.rawGetPointee && (e3 = this.rawGetPointee(e3)), e3;
      },
      destructor(e3) {
        var t2;
        (t2 = this.rawDestructor) === null || t2 === void 0 || t2.call(this, e3);
      },
      argPackAdvance: N2,
      readValueFromPointer: lt,
      fromWireType: Lr
    });
  };
  function Et(e3, t2, r2, n, a2, i2, u2, s2, l2, d2, h2) {
    this.name = e3, this.registeredClass = t2, this.isReference = r2, this.isConst = n, this.isSmartPointer = a2, this.pointeeType = i2, this.sharingPolicy = u2, this.rawGetPointee = s2, this.rawConstructor = l2, this.rawShare = d2, this.rawDestructor = h2, !a2 && t2.baseClass === void 0 ? n ? (this.toWireType = Ir, this.destructorFunction = null) : (this.toWireType = Mr, this.destructorFunction = null) : this.toWireType = Dr;
  }
  var de = (e3, t2, r2) => {
    c2.hasOwnProperty(e3) || Ct("Replacing nonexistent public symbol"), c2[e3].overloadTable !== void 0 && r2 !== void 0 ? c2[e3].overloadTable[r2] = t2 : (c2[e3] = t2, c2[e3].argCount = r2);
  }, he = [], pe, g2 = (e3) => {
    var t2 = he[e3];
    return t2 || (he[e3] = t2 = pe.get(e3)), t2;
  }, Wr = function(e3, t2) {
    let r2 = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : [];
    if (e3.includes("j"))
      return dynCallLegacy(e3, t2, r2);
    var n = g2(t2), a2 = n(...r2);
    return a2;
  }, Ur = function(e3, t2) {
    let r2 = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : false;
    return function() {
      for (var n = arguments.length, a2 = new Array(n), i2 = 0; i2 < n; i2++)
        a2[i2] = arguments[i2];
      return Wr(e3, t2, a2, r2);
    };
  }, U = function(e3, t2) {
    e3 = j(e3);
    function r2() {
      if (e3.includes("j"))
        return Ur(e3, t2);
      var a2 = g2(t2);
      return a2;
    }
    var n = r2();
    return typeof n != "function" && C2(`unknown function pointer with signature ${e3}: ${t2}`), n;
  };
  class Vr extends Error {
  }
  var ve = (e3) => {
    var t2 = Nn(e3), r2 = j(t2);
    return et(t2), r2;
  }, _t = (e3, t2) => {
    var r2 = [], n = {};
    function a2(i2) {
      if (!n[i2] && !K2[i2]) {
        if (bt[i2]) {
          bt[i2].forEach(a2);
          return;
        }
        r2.push(i2), n[i2] = true;
      }
    }
    throw t2.forEach(a2), new Vr(`${e3}: ` + r2.map(ve).join([", "]));
  }, kr = (e3, t2, r2, n, a2, i2, u2, s2, l2, d2, h2, p2, w2) => {
    h2 = j(h2), i2 = U(a2, i2), s2 && (s2 = U(u2, s2)), d2 && (d2 = U(l2, d2)), w2 = U(p2, w2);
    var b = Ar(h2);
    le(b, function() {
      _t(`Cannot construct ${h2} due to unbound types`, [n]);
    }), tt([e3, t2, r2], n ? [n] : [], (_) => {
      _ = _[0];
      var S, A2;
      n ? (S = _.registeredClass, A2 = S.instancePrototype) : A2 = Tt.prototype;
      var I2 = Ut(h2, function() {
        if (Object.getPrototypeOf(this) !== X)
          throw new ft(`Use 'new' to construct ${h2}`);
        if (L.constructor_body === void 0)
          throw new ft(`${h2} has no accessible constructor`);
        for (var Oe = arguments.length, xt = new Array(Oe), At = 0; At < Oe; At++)
          xt[At] = arguments[At];
        var xe = L.constructor_body[xt.length];
        if (xe === void 0)
          throw new ft(`Tried to invoke ctor of ${h2} with invalid number of parameters (${xt.length}) - expected (${Object.keys(L.constructor_body).toString()}) parameters instead!`);
        return xe.apply(this, xt);
      }), X = Object.create(A2, {
        constructor: {
          value: I2
        }
      });
      I2.prototype = X;
      var L = new Sr(h2, I2, X, w2, S, i2, s2, d2);
      if (L.baseClass) {
        var W, Ot;
        (Ot = (W = L.baseClass).__derivedClasses) !== null && Ot !== void 0 || (W.__derivedClasses = []), L.baseClass.__derivedClasses.push(L);
      }
      var Ra = new Et(h2, L, true, false, false), Ee = new Et(h2 + "*", L, false, false, false), _e = new Et(h2 + " const*", L, false, true, false);
      return ue[e3] = {
        pointerType: Ee,
        constPointerType: _e
      }, de(b, I2), [Ra, Ee, _e];
    });
  }, kt = (e3, t2) => {
    for (var r2 = [], n = 0; n < e3; n++)
      r2.push(P[t2 + n * 4 >> 2]);
    return r2;
  };
  function Hr(e3) {
    for (var t2 = 1; t2 < e3.length; ++t2)
      if (e3[t2] !== null && e3[t2].destructorFunction === void 0)
        return true;
    return false;
  }
  function Ht(e3, t2, r2, n, a2, i2) {
    var u2 = t2.length;
    u2 < 2 && C2("argTypes array size mismatch! Must at least get return value and 'this' types!");
    var s2 = t2[1] !== null && r2 !== null, l2 = Hr(t2), d2 = t2[0].name !== "void", h2 = u2 - 2, p2 = new Array(h2), w2 = [], b = [], _ = function() {
      b.length = 0;
      var S;
      w2.length = s2 ? 2 : 1, w2[0] = a2, s2 && (S = t2[1].toWireType(b, this), w2[1] = S);
      for (var A2 = 0; A2 < h2; ++A2)
        p2[A2] = t2[A2 + 2].toWireType(b, A2 < 0 || arguments.length <= A2 ? void 0 : arguments[A2]), w2.push(p2[A2]);
      var I2 = n(...w2);
      function X(L) {
        if (l2)
          Lt(b);
        else
          for (var W = s2 ? 1 : 2; W < t2.length; W++) {
            var Ot = W === 1 ? S : p2[W - 2];
            t2[W].destructorFunction !== null && t2[W].destructorFunction(Ot);
          }
        if (d2)
          return t2[0].fromWireType(L);
      }
      return X(I2);
    };
    return Ut(e3, _);
  }
  var Nr = (e3, t2, r2, n, a2, i2) => {
    var u2 = kt(t2, r2);
    a2 = U(n, a2), tt([], [e3], (s2) => {
      s2 = s2[0];
      var l2 = `constructor ${s2.name}`;
      if (s2.registeredClass.constructor_body === void 0 && (s2.registeredClass.constructor_body = []), s2.registeredClass.constructor_body[t2 - 1] !== void 0)
        throw new ft(`Cannot register multiple constructors with identical number of parameters (${t2 - 1}) for class '${s2.name}'! Overload resolution is currently only performed using the parameter count, not actual type info!`);
      return s2.registeredClass.constructor_body[t2 - 1] = () => {
        _t(`Cannot construct ${s2.name} due to unbound types`, u2);
      }, tt([], u2, (d2) => (d2.splice(1, 0, null), s2.registeredClass.constructor_body[t2 - 1] = Ht(l2, d2, null, a2, i2), [])), [];
    });
  }, ye = (e3) => {
    e3 = e3.trim();
    const t2 = e3.indexOf("(");
    return t2 === -1 ? e3 : e3.slice(0, t2);
  }, zr = (e3, t2, r2, n, a2, i2, u2, s2, l2, d2) => {
    var h2 = kt(r2, n);
    t2 = j(t2), t2 = ye(t2), i2 = U(a2, i2), tt([], [e3], (p2) => {
      p2 = p2[0];
      var w2 = `${p2.name}.${t2}`;
      t2.startsWith("@@") && (t2 = Symbol[t2.substring(2)]), s2 && p2.registeredClass.pureVirtualFunctions.push(t2);
      function b() {
        _t(`Cannot call ${w2} due to unbound types`, h2);
      }
      var _ = p2.registeredClass.instancePrototype, S = _[t2];
      return S === void 0 || S.overloadTable === void 0 && S.className !== p2.name && S.argCount === r2 - 2 ? (b.argCount = r2 - 2, b.className = p2.name, _[t2] = b) : (ce(_, t2, w2), _[t2].overloadTable[r2 - 2] = b), tt([], h2, (A2) => {
        var I2 = Ht(w2, A2, p2, i2, u2);
        return _[t2].overloadTable === void 0 ? (I2.argCount = r2 - 2, _[t2] = I2) : _[t2].overloadTable[r2 - 2] = I2, [];
      }), [];
    });
  }, Nt = [], z = [], zt = (e3) => {
    e3 > 9 && --z[e3 + 1] === 0 && (z[e3] = void 0, Nt.push(e3));
  }, Gr = () => z.length / 2 - 5 - Nt.length, Xr = () => {
    z.push(0, 1, void 0, 1, null, 1, true, 1, false, 1), c2.count_emval_handles = Gr;
  }, G2 = {
    toValue: (e3) => (e3 || C2(`Cannot use deleted val. handle = ${e3}`), z[e3]),
    toHandle: (e3) => {
      switch (e3) {
        case void 0:
          return 2;
        case null:
          return 4;
        case true:
          return 6;
        case false:
          return 8;
        default: {
          const t2 = Nt.pop() || z.length;
          return z[t2] = e3, z[t2 + 1] = 1, t2;
        }
      }
    }
  }, me = {
    name: "emscripten::val",
    fromWireType: (e3) => {
      var t2 = G2.toValue(e3);
      return zt(e3), t2;
    },
    toWireType: (e3, t2) => G2.toHandle(t2),
    argPackAdvance: N2,
    readValueFromPointer: lt,
    destructorFunction: null
  }, qr = (e3) => V2(e3, me), Yr = (e3, t2) => {
    switch (t2) {
      case 4:
        return function(r2) {
          return this.fromWireType(Kt[r2 >> 2]);
        };
      case 8:
        return function(r2) {
          return this.fromWireType(te[r2 >> 3]);
        };
      default:
        throw new TypeError(`invalid float width (${t2}): ${e3}`);
    }
  }, Zr = (e3, t2, r2) => {
    t2 = j(t2), V2(e3, {
      name: t2,
      fromWireType: (n) => n,
      toWireType: (n, a2) => a2,
      argPackAdvance: N2,
      readValueFromPointer: Yr(t2, r2),
      destructorFunction: null
    });
  }, Qr = (e3, t2, r2, n, a2, i2, u2, s2) => {
    var l2 = kt(t2, r2);
    e3 = j(e3), e3 = ye(e3), a2 = U(n, a2), le(e3, function() {
      _t(`Cannot call ${e3} due to unbound types`, l2);
    }, t2 - 1), tt([], l2, (d2) => {
      var h2 = [d2[0], null].concat(d2.slice(1));
      return de(e3, Ht(e3, h2, null, a2, i2), t2 - 1), [];
    });
  }, Jr = (e3, t2, r2) => {
    switch (t2) {
      case 1:
        return r2 ? (n) => Q2[n] : (n) => B2[n];
      case 2:
        return r2 ? (n) => ut[n >> 1] : (n) => vt[n >> 1];
      case 4:
        return r2 ? (n) => at[n >> 2] : (n) => P[n >> 2];
      default:
        throw new TypeError(`invalid integer width (${t2}): ${e3}`);
    }
  }, Kr = (e3, t2, r2, n, a2) => {
    t2 = j(t2);
    var i2 = (h2) => h2;
    if (n === 0) {
      var u2 = 32 - 8 * r2;
      i2 = (h2) => h2 << u2 >>> u2;
    }
    var s2 = t2.includes("unsigned"), l2 = (h2, p2) => {
    }, d2;
    s2 ? d2 = function(h2, p2) {
      return l2(p2, this.name), p2 >>> 0;
    } : d2 = function(h2, p2) {
      return l2(p2, this.name), p2;
    }, V2(e3, {
      name: t2,
      fromWireType: i2,
      toWireType: d2,
      argPackAdvance: N2,
      readValueFromPointer: Jr(t2, r2, n !== 0),
      destructorFunction: null
    });
  }, tn = (e3, t2, r2) => {
    var n = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array], a2 = n[t2];
    function i2(u2) {
      var s2 = P[u2 >> 2], l2 = P[u2 + 4 >> 2];
      return new a2(Q2.buffer, l2, s2);
    }
    r2 = j(r2), V2(e3, {
      name: r2,
      fromWireType: i2,
      argPackAdvance: N2,
      readValueFromPointer: i2
    }, {
      ignoreDuplicateRegistrations: true
    });
  }, en = Object.assign({
    optional: true
  }, me), rn = (e3, t2) => {
    V2(e3, en);
  }, nn = (e3, t2, r2, n) => {
    if (!(n > 0)) return 0;
    for (var a2 = r2, i2 = r2 + n - 1, u2 = 0; u2 < e3.length; ++u2) {
      var s2 = e3.charCodeAt(u2);
      if (s2 >= 55296 && s2 <= 57343) {
        var l2 = e3.charCodeAt(++u2);
        s2 = 65536 + ((s2 & 1023) << 10) | l2 & 1023;
      }
      if (s2 <= 127) {
        if (r2 >= i2) break;
        t2[r2++] = s2;
      } else if (s2 <= 2047) {
        if (r2 + 1 >= i2) break;
        t2[r2++] = 192 | s2 >> 6, t2[r2++] = 128 | s2 & 63;
      } else if (s2 <= 65535) {
        if (r2 + 2 >= i2) break;
        t2[r2++] = 224 | s2 >> 12, t2[r2++] = 128 | s2 >> 6 & 63, t2[r2++] = 128 | s2 & 63;
      } else {
        if (r2 + 3 >= i2) break;
        t2[r2++] = 240 | s2 >> 18, t2[r2++] = 128 | s2 >> 12 & 63, t2[r2++] = 128 | s2 >> 6 & 63, t2[r2++] = 128 | s2 & 63;
      }
    }
    return t2[r2] = 0, r2 - a2;
  }, it = (e3, t2, r2) => nn(e3, B2, t2, r2), ge = (e3) => {
    for (var t2 = 0, r2 = 0; r2 < e3.length; ++r2) {
      var n = e3.charCodeAt(r2);
      n <= 127 ? t2++ : n <= 2047 ? t2 += 2 : n >= 55296 && n <= 57343 ? (t2 += 4, ++r2) : t2 += 3;
    }
    return t2;
  }, we = typeof TextDecoder < "u" ? new TextDecoder() : void 0, $e = function(e3) {
    let t2 = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0, r2 = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : NaN;
    for (var n = t2 + r2, a2 = t2; e3[a2] && !(a2 >= n); ) ++a2;
    if (a2 - t2 > 16 && e3.buffer && we)
      return we.decode(e3.subarray(t2, a2));
    for (var i2 = ""; t2 < a2; ) {
      var u2 = e3[t2++];
      if (!(u2 & 128)) {
        i2 += String.fromCharCode(u2);
        continue;
      }
      var s2 = e3[t2++] & 63;
      if ((u2 & 224) == 192) {
        i2 += String.fromCharCode((u2 & 31) << 6 | s2);
        continue;
      }
      var l2 = e3[t2++] & 63;
      if ((u2 & 240) == 224 ? u2 = (u2 & 15) << 12 | s2 << 6 | l2 : u2 = (u2 & 7) << 18 | s2 << 12 | l2 << 6 | e3[t2++] & 63, u2 < 65536)
        i2 += String.fromCharCode(u2);
      else {
        var d2 = u2 - 65536;
        i2 += String.fromCharCode(55296 | d2 >> 10, 56320 | d2 & 1023);
      }
    }
    return i2;
  }, an = (e3, t2) => e3 ? $e(B2, e3, t2) : "", on = (e3, t2) => {
    t2 = j(t2), V2(e3, {
      name: t2,
      fromWireType(r2) {
        for (var n = P[r2 >> 2], a2 = r2 + 4, i2, s2, u2 = a2, s2 = 0; s2 <= n; ++s2) {
          var l2 = a2 + s2;
          if (s2 == n || B2[l2] == 0) {
            var d2 = l2 - u2, h2 = an(u2, d2);
            i2 === void 0 ? i2 = h2 : (i2 += "\0", i2 += h2), u2 = l2 + 1;
          }
        }
        return et(r2), i2;
      },
      toWireType(r2, n) {
        n instanceof ArrayBuffer && (n = new Uint8Array(n));
        var a2, i2 = typeof n == "string";
        i2 || ArrayBuffer.isView(n) && n.BYTES_PER_ELEMENT == 1 || C2("Cannot pass non-string to std::string"), i2 ? a2 = ge(n) : a2 = n.length;
        var u2 = Pe(4 + a2 + 1), s2 = u2 + 4;
        return P[u2 >> 2] = a2, i2 ? it(n, s2, a2 + 1) : B2.set(n, s2), r2 !== null && r2.push(et, u2), u2;
      },
      argPackAdvance: N2,
      readValueFromPointer: lt,
      destructorFunction(r2) {
        et(r2);
      }
    });
  }, be = typeof TextDecoder < "u" ? new TextDecoder("utf-16le") : void 0, sn = (e3, t2) => {
    for (var r2 = e3, n = r2 >> 1, a2 = n + t2 / 2; !(n >= a2) && vt[n]; ) ++n;
    if (r2 = n << 1, r2 - e3 > 32 && be) return be.decode(B2.subarray(e3, r2));
    for (var i2 = "", u2 = 0; !(u2 >= t2 / 2); ++u2) {
      var s2 = ut[e3 + u2 * 2 >> 1];
      if (s2 == 0) break;
      i2 += String.fromCharCode(s2);
    }
    return i2;
  }, un = (e3, t2, r2) => {
    if (r2 != null || (r2 = 2147483647), r2 < 2) return 0;
    r2 -= 2;
    for (var n = t2, a2 = r2 < e3.length * 2 ? r2 / 2 : e3.length, i2 = 0; i2 < a2; ++i2) {
      var u2 = e3.charCodeAt(i2);
      ut[t2 >> 1] = u2, t2 += 2;
    }
    return ut[t2 >> 1] = 0, t2 - n;
  }, cn = (e3) => e3.length * 2, ln = (e3, t2) => {
    for (var r2 = 0, n = ""; !(r2 >= t2 / 4); ) {
      var a2 = at[e3 + r2 * 4 >> 2];
      if (a2 == 0) break;
      if (++r2, a2 >= 65536) {
        var i2 = a2 - 65536;
        n += String.fromCharCode(55296 | i2 >> 10, 56320 | i2 & 1023);
      } else
        n += String.fromCharCode(a2);
    }
    return n;
  }, fn = (e3, t2, r2) => {
    if (r2 != null || (r2 = 2147483647), r2 < 4) return 0;
    for (var n = t2, a2 = n + r2 - 4, i2 = 0; i2 < e3.length; ++i2) {
      var u2 = e3.charCodeAt(i2);
      if (u2 >= 55296 && u2 <= 57343) {
        var s2 = e3.charCodeAt(++i2);
        u2 = 65536 + ((u2 & 1023) << 10) | s2 & 1023;
      }
      if (at[t2 >> 2] = u2, t2 += 4, t2 + 4 > a2) break;
    }
    return at[t2 >> 2] = 0, t2 - n;
  }, dn = (e3) => {
    for (var t2 = 0, r2 = 0; r2 < e3.length; ++r2) {
      var n = e3.charCodeAt(r2);
      n >= 55296 && n <= 57343 && ++r2, t2 += 4;
    }
    return t2;
  }, hn = (e3, t2, r2) => {
    r2 = j(r2);
    var n, a2, i2, u2;
    t2 === 2 ? (n = sn, a2 = un, u2 = cn, i2 = (s2) => vt[s2 >> 1]) : t2 === 4 && (n = ln, a2 = fn, u2 = dn, i2 = (s2) => P[s2 >> 2]), V2(e3, {
      name: r2,
      fromWireType: (s2) => {
        for (var l2 = P[s2 >> 2], d2, h2 = s2 + 4, p2 = 0; p2 <= l2; ++p2) {
          var w2 = s2 + 4 + p2 * t2;
          if (p2 == l2 || i2(w2) == 0) {
            var b = w2 - h2, _ = n(h2, b);
            d2 === void 0 ? d2 = _ : (d2 += "\0", d2 += _), h2 = w2 + t2;
          }
        }
        return et(s2), d2;
      },
      toWireType: (s2, l2) => {
        typeof l2 != "string" && C2(`Cannot pass non-string to C++ string type ${r2}`);
        var d2 = u2(l2), h2 = Pe(4 + d2 + t2);
        return P[h2 >> 2] = d2 / t2, a2(l2, h2 + 4, d2 + t2), s2 !== null && s2.push(et, h2), h2;
      },
      argPackAdvance: N2,
      readValueFromPointer: lt,
      destructorFunction(s2) {
        et(s2);
      }
    });
  }, pn = (e3, t2, r2, n, a2, i2) => {
    $t[e3] = {
      name: j(t2),
      rawConstructor: U(r2, n),
      rawDestructor: U(a2, i2),
      fields: []
    };
  }, vn = (e3, t2, r2, n, a2, i2, u2, s2, l2, d2) => {
    $t[e3].fields.push({
      fieldName: j(t2),
      getterReturnType: r2,
      getter: U(n, a2),
      getterContext: i2,
      setterArgumentType: u2,
      setter: U(s2, l2),
      setterContext: d2
    });
  }, yn = (e3, t2) => {
    t2 = j(t2), V2(e3, {
      isVoid: true,
      name: t2,
      argPackAdvance: 0,
      fromWireType: () => {
      },
      toWireType: (r2, n) => {
      }
    });
  }, Gt = [], mn = (e3, t2, r2, n) => (e3 = Gt[e3], t2 = G2.toValue(t2), e3(null, t2, r2, n)), gn = {}, wn = (e3) => {
    var t2 = gn[e3];
    return t2 === void 0 ? j(e3) : t2;
  }, Ce = () => {
    if (typeof globalThis == "object")
      return globalThis;
    function e3(t2) {
      t2.$$$embind_global$$$ = t2;
      var r2 = typeof $$$embind_global$$$ == "object" && t2.$$$embind_global$$$ == t2;
      return r2 || delete t2.$$$embind_global$$$, r2;
    }
    if (typeof $$$embind_global$$$ == "object" || (typeof global == "object" && e3(global) ? $$$embind_global$$$ = global : typeof self == "object" && e3(self) && ($$$embind_global$$$ = self), typeof $$$embind_global$$$ == "object"))
      return $$$embind_global$$$;
    throw Error("unable to get global object.");
  }, $n = (e3) => e3 === 0 ? G2.toHandle(Ce()) : (e3 = wn(e3), G2.toHandle(Ce()[e3])), bn = (e3) => {
    var t2 = Gt.length;
    return Gt.push(e3), t2;
  }, Te = (e3, t2) => {
    var r2 = K2[e3];
    return r2 === void 0 && C2(`${t2} has unknown type ${ve(e3)}`), r2;
  }, Cn = (e3, t2) => {
    for (var r2 = new Array(e3), n = 0; n < e3; ++n)
      r2[n] = Te(P[t2 + n * 4 >> 2], `parameter ${n}`);
    return r2;
  }, Tn = (e3, t2, r2) => {
    var n = [], a2 = e3.toWireType(n, r2);
    return n.length && (P[t2 >> 2] = G2.toHandle(n)), a2;
  }, Pn = Reflect.construct, En = (e3, t2, r2) => {
    var n = Cn(e3, t2), a2 = n.shift();
    e3--;
    var i2 = new Array(e3), u2 = (l2, d2, h2, p2) => {
      for (var w2 = 0, b = 0; b < e3; ++b)
        i2[b] = n[b].readValueFromPointer(p2 + w2), w2 += n[b].argPackAdvance;
      var _ = r2 === 1 ? Pn(d2, i2) : d2.apply(l2, i2);
      return Tn(a2, h2, _);
    }, s2 = `methodCaller<(${n.map((l2) => l2.name).join(", ")}) => ${a2.name}>`;
    return bn(Ut(s2, u2));
  }, _n = (e3) => {
    e3 > 9 && (z[e3 + 1] += 1);
  }, On = (e3) => {
    var t2 = G2.toValue(e3);
    Lt(t2), zt(e3);
  }, xn = (e3, t2) => {
    e3 = Te(e3, "_emval_take_value");
    var r2 = e3.readValueFromPointer(t2);
    return G2.toHandle(r2);
  }, An = (e3, t2, r2, n) => {
    var a2 = (/* @__PURE__ */ new Date()).getFullYear(), i2 = new Date(a2, 0, 1), u2 = new Date(a2, 6, 1), s2 = i2.getTimezoneOffset(), l2 = u2.getTimezoneOffset(), d2 = Math.max(s2, l2);
    P[e3 >> 2] = d2 * 60, at[t2 >> 2] = +(s2 != l2);
    var h2 = (b) => {
      var _ = b >= 0 ? "-" : "+", S = Math.abs(b), A2 = String(Math.floor(S / 60)).padStart(2, "0"), I2 = String(S % 60).padStart(2, "0");
      return `UTC${_}${A2}${I2}`;
    }, p2 = h2(s2), w2 = h2(l2);
    l2 < s2 ? (it(p2, r2, 17), it(w2, n, 17)) : (it(p2, n, 17), it(w2, r2, 17));
  }, Sn = () => 2147483648, In = (e3, t2) => Math.ceil(e3 / t2) * t2, Dn = (e3) => {
    var t2 = nt.buffer, r2 = (e3 - t2.byteLength + 65535) / 65536 | 0;
    try {
      return nt.grow(r2), ee(), 1;
    } catch {
    }
  }, Mn = (e3) => {
    var t2 = B2.length;
    e3 >>>= 0;
    var r2 = Sn();
    if (e3 > r2)
      return false;
    for (var n = 1; n <= 4; n *= 2) {
      var a2 = t2 * (1 + 0.2 / n);
      a2 = Math.min(a2, e3 + 100663296);
      var i2 = Math.min(r2, In(Math.max(e3, a2), 65536)), u2 = Dn(i2);
      if (u2)
        return true;
    }
    return false;
  }, Xt = {}, Fn = () => M2 || "./this.program", ht = () => {
    if (!ht.strings) {
      var e3 = (typeof navigator == "object" && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8", t2 = {
        USER: "web_user",
        LOGNAME: "web_user",
        PATH: "/",
        PWD: "/",
        HOME: "/home/web_user",
        LANG: e3,
        _: Fn()
      };
      for (var r2 in Xt)
        Xt[r2] === void 0 ? delete t2[r2] : t2[r2] = Xt[r2];
      var n = [];
      for (var r2 in t2)
        n.push(`${r2}=${t2[r2]}`);
      ht.strings = n;
    }
    return ht.strings;
  }, jn = (e3, t2) => {
    var r2 = 0, n = 0;
    for (var a2 of ht()) {
      var i2 = t2 + r2;
      P[e3 + n >> 2] = i2, r2 += it(a2, i2, 1 / 0) + 1, n += 4;
    }
    return 0;
  }, Rn = (e3, t2) => {
    var r2 = ht();
    P[e3 >> 2] = r2.length;
    var n = 0;
    for (var a2 of r2)
      n += ge(a2) + 1;
    return P[t2 >> 2] = n, 0;
  }, Ln = (e3) => 52;
  function Bn(e3, t2, r2, n, a2) {
    return 70;
  }
  var Wn = [null, [], []], Un = (e3, t2) => {
    var r2 = Wn[e3];
    t2 === 0 || t2 === 10 ? ((e3 === 1 ? st : k2)($e(r2)), r2.length = 0) : r2.push(t2);
  }, Vn = (e3, t2, r2, n) => {
    for (var a2 = 0, i2 = 0; i2 < r2; i2++) {
      var u2 = P[t2 >> 2], s2 = P[t2 + 4 >> 2];
      t2 += 8;
      for (var l2 = 0; l2 < s2; l2++)
        Un(e3, B2[u2 + l2]);
      a2 += s2;
    }
    return P[n >> 2] = a2, 0;
  }, kn = (e3) => e3;
  br(), _r(), Br(), Xr(), c2.noExitRuntime && c2.noExitRuntime, c2.print && (st = c2.print), c2.printErr && (k2 = c2.printErr), c2.wasmBinary && (Z = c2.wasmBinary), c2.arguments && c2.arguments, c2.thisProgram && (M2 = c2.thisProgram);
  var Hn = {
    s: ur,
    w: cr,
    a: lr,
    j: fr,
    m: dr,
    N: hr,
    p: pr,
    da: vr,
    d: yr,
    _: mr,
    sa: wr,
    Z: $r,
    na: Tr,
    qa: kr,
    pa: Nr,
    F: zr,
    la: qr,
    R: Zr,
    S: Qr,
    y: Kr,
    t: tn,
    ra: rn,
    ma: on,
    O: hn,
    K: pn,
    ta: vn,
    oa: yn,
    V: mn,
    ua: zt,
    wa: $n,
    $: En,
    T: _n,
    va: On,
    ka: xn,
    aa: An,
    ea: Mn,
    ba: jn,
    ca: Rn,
    fa: Ln,
    X: Bn,
    Q: Vn,
    I: ba,
    C: Ta,
    U: oa,
    P: Sa,
    q: ma,
    b: ea,
    D: $a,
    ia: Ea,
    c: na,
    ha: _a,
    h: aa,
    i: la,
    r: da,
    M: wa,
    v: pa,
    E: ya,
    J: ga,
    A: Pa,
    H: Ia,
    W: Fa,
    k: sa,
    f: ia,
    e: ra,
    g: ta,
    L: Aa,
    l: ca,
    ja: Ca,
    o: ha,
    x: fa,
    u: va,
    ga: xa,
    B: Oa,
    n: ua,
    G: Da,
    Y: Ma,
    z: kn
  }, E2 = await or();
  E2.ya;
  var Nn = E2.za, et = c2._free = E2.Aa, Pe = c2._malloc = E2.Ca, zn = E2.Da, v = E2.Ea, Gn = E2.Fa, Xn = E2.Ga, qn = E2.Ha, Yn = E2.Ia, Zn = E2.Ja, Qn = E2.Ka;
  c2.dynCall_viijii = E2.La;
  var Jn = c2.dynCall_vij = E2.Ma;
  c2.dynCall_jiji = E2.Na;
  var Kn = c2.dynCall_jiiii = E2.Oa;
  c2.dynCall_iiiiij = E2.Pa, c2.dynCall_iiiiijj = E2.Qa, c2.dynCall_iiiiiijj = E2.Ra;
  function ta(e3, t2, r2, n) {
    var a2 = m2();
    try {
      g2(e3)(t2, r2, n);
    } catch (i2) {
      if (y(a2), i2 !== i2 + 0) throw i2;
      v(1, 0);
    }
  }
  function ea(e3, t2) {
    var r2 = m2();
    try {
      return g2(e3)(t2);
    } catch (n) {
      if (y(r2), n !== n + 0) throw n;
      v(1, 0);
    }
  }
  function ra(e3, t2, r2) {
    var n = m2();
    try {
      g2(e3)(t2, r2);
    } catch (a2) {
      if (y(n), a2 !== a2 + 0) throw a2;
      v(1, 0);
    }
  }
  function na(e3, t2, r2) {
    var n = m2();
    try {
      return g2(e3)(t2, r2);
    } catch (a2) {
      if (y(n), a2 !== a2 + 0) throw a2;
      v(1, 0);
    }
  }
  function aa(e3, t2, r2, n) {
    var a2 = m2();
    try {
      return g2(e3)(t2, r2, n);
    } catch (i2) {
      if (y(a2), i2 !== i2 + 0) throw i2;
      v(1, 0);
    }
  }
  function oa(e3, t2, r2, n, a2) {
    var i2 = m2();
    try {
      return g2(e3)(t2, r2, n, a2);
    } catch (u2) {
      if (y(i2), u2 !== u2 + 0) throw u2;
      v(1, 0);
    }
  }
  function ia(e3, t2) {
    var r2 = m2();
    try {
      g2(e3)(t2);
    } catch (n) {
      if (y(r2), n !== n + 0) throw n;
      v(1, 0);
    }
  }
  function sa(e3) {
    var t2 = m2();
    try {
      g2(e3)();
    } catch (r2) {
      if (y(t2), r2 !== r2 + 0) throw r2;
      v(1, 0);
    }
  }
  function ua(e3, t2, r2, n, a2, i2, u2, s2, l2, d2, h2) {
    var p2 = m2();
    try {
      g2(e3)(t2, r2, n, a2, i2, u2, s2, l2, d2, h2);
    } catch (w2) {
      if (y(p2), w2 !== w2 + 0) throw w2;
      v(1, 0);
    }
  }
  function ca(e3, t2, r2, n, a2) {
    var i2 = m2();
    try {
      g2(e3)(t2, r2, n, a2);
    } catch (u2) {
      if (y(i2), u2 !== u2 + 0) throw u2;
      v(1, 0);
    }
  }
  function la(e3, t2, r2, n, a2) {
    var i2 = m2();
    try {
      return g2(e3)(t2, r2, n, a2);
    } catch (u2) {
      if (y(i2), u2 !== u2 + 0) throw u2;
      v(1, 0);
    }
  }
  function fa(e3, t2, r2, n, a2, i2, u2) {
    var s2 = m2();
    try {
      g2(e3)(t2, r2, n, a2, i2, u2);
    } catch (l2) {
      if (y(s2), l2 !== l2 + 0) throw l2;
      v(1, 0);
    }
  }
  function da(e3, t2, r2, n, a2, i2) {
    var u2 = m2();
    try {
      return g2(e3)(t2, r2, n, a2, i2);
    } catch (s2) {
      if (y(u2), s2 !== s2 + 0) throw s2;
      v(1, 0);
    }
  }
  function ha(e3, t2, r2, n, a2, i2) {
    var u2 = m2();
    try {
      g2(e3)(t2, r2, n, a2, i2);
    } catch (s2) {
      if (y(u2), s2 !== s2 + 0) throw s2;
      v(1, 0);
    }
  }
  function pa(e3, t2, r2, n, a2, i2, u2) {
    var s2 = m2();
    try {
      return g2(e3)(t2, r2, n, a2, i2, u2);
    } catch (l2) {
      if (y(s2), l2 !== l2 + 0) throw l2;
      v(1, 0);
    }
  }
  function va(e3, t2, r2, n, a2, i2, u2, s2) {
    var l2 = m2();
    try {
      g2(e3)(t2, r2, n, a2, i2, u2, s2);
    } catch (d2) {
      if (y(l2), d2 !== d2 + 0) throw d2;
      v(1, 0);
    }
  }
  function ya(e3, t2, r2, n, a2, i2, u2, s2) {
    var l2 = m2();
    try {
      return g2(e3)(t2, r2, n, a2, i2, u2, s2);
    } catch (d2) {
      if (y(l2), d2 !== d2 + 0) throw d2;
      v(1, 0);
    }
  }
  function ma(e3) {
    var t2 = m2();
    try {
      return g2(e3)();
    } catch (r2) {
      if (y(t2), r2 !== r2 + 0) throw r2;
      v(1, 0);
    }
  }
  function ga(e3, t2, r2, n, a2, i2, u2, s2, l2) {
    var d2 = m2();
    try {
      return g2(e3)(t2, r2, n, a2, i2, u2, s2, l2);
    } catch (h2) {
      if (y(d2), h2 !== h2 + 0) throw h2;
      v(1, 0);
    }
  }
  function wa(e3, t2, r2, n, a2, i2, u2) {
    var s2 = m2();
    try {
      return g2(e3)(t2, r2, n, a2, i2, u2);
    } catch (l2) {
      if (y(s2), l2 !== l2 + 0) throw l2;
      v(1, 0);
    }
  }
  function $a(e3, t2, r2, n) {
    var a2 = m2();
    try {
      return g2(e3)(t2, r2, n);
    } catch (i2) {
      if (y(a2), i2 !== i2 + 0) throw i2;
      v(1, 0);
    }
  }
  function ba(e3, t2, r2, n) {
    var a2 = m2();
    try {
      return g2(e3)(t2, r2, n);
    } catch (i2) {
      if (y(a2), i2 !== i2 + 0) throw i2;
      v(1, 0);
    }
  }
  function Ca(e3, t2, r2, n, a2, i2, u2, s2) {
    var l2 = m2();
    try {
      g2(e3)(t2, r2, n, a2, i2, u2, s2);
    } catch (d2) {
      if (y(l2), d2 !== d2 + 0) throw d2;
      v(1, 0);
    }
  }
  function Ta(e3, t2, r2, n, a2, i2) {
    var u2 = m2();
    try {
      return g2(e3)(t2, r2, n, a2, i2);
    } catch (s2) {
      if (y(u2), s2 !== s2 + 0) throw s2;
      v(1, 0);
    }
  }
  function Pa(e3, t2, r2, n, a2, i2, u2, s2, l2, d2) {
    var h2 = m2();
    try {
      return g2(e3)(t2, r2, n, a2, i2, u2, s2, l2, d2);
    } catch (p2) {
      if (y(h2), p2 !== p2 + 0) throw p2;
      v(1, 0);
    }
  }
  function Ea(e3, t2, r2) {
    var n = m2();
    try {
      return g2(e3)(t2, r2);
    } catch (a2) {
      if (y(n), a2 !== a2 + 0) throw a2;
      v(1, 0);
    }
  }
  function _a(e3, t2, r2, n, a2) {
    var i2 = m2();
    try {
      return g2(e3)(t2, r2, n, a2);
    } catch (u2) {
      if (y(i2), u2 !== u2 + 0) throw u2;
      v(1, 0);
    }
  }
  function Oa(e3, t2, r2, n, a2, i2, u2, s2, l2, d2) {
    var h2 = m2();
    try {
      g2(e3)(t2, r2, n, a2, i2, u2, s2, l2, d2);
    } catch (p2) {
      if (y(h2), p2 !== p2 + 0) throw p2;
      v(1, 0);
    }
  }
  function xa(e3, t2, r2, n, a2, i2, u2, s2, l2) {
    var d2 = m2();
    try {
      g2(e3)(t2, r2, n, a2, i2, u2, s2, l2);
    } catch (h2) {
      if (y(d2), h2 !== h2 + 0) throw h2;
      v(1, 0);
    }
  }
  function Aa(e3, t2, r2, n, a2, i2, u2) {
    var s2 = m2();
    try {
      g2(e3)(t2, r2, n, a2, i2, u2);
    } catch (l2) {
      if (y(s2), l2 !== l2 + 0) throw l2;
      v(1, 0);
    }
  }
  function Sa(e3, t2, r2, n) {
    var a2 = m2();
    try {
      return g2(e3)(t2, r2, n);
    } catch (i2) {
      if (y(a2), i2 !== i2 + 0) throw i2;
      v(1, 0);
    }
  }
  function Ia(e3, t2, r2, n, a2, i2, u2, s2, l2, d2, h2, p2) {
    var w2 = m2();
    try {
      return g2(e3)(t2, r2, n, a2, i2, u2, s2, l2, d2, h2, p2);
    } catch (b) {
      if (y(w2), b !== b + 0) throw b;
      v(1, 0);
    }
  }
  function Da(e3, t2, r2, n, a2, i2, u2, s2, l2, d2, h2, p2, w2, b, _, S) {
    var A2 = m2();
    try {
      g2(e3)(t2, r2, n, a2, i2, u2, s2, l2, d2, h2, p2, w2, b, _, S);
    } catch (I2) {
      if (y(A2), I2 !== I2 + 0) throw I2;
      v(1, 0);
    }
  }
  function Ma(e3, t2, r2, n) {
    var a2 = m2();
    try {
      Jn(e3, t2, r2, n);
    } catch (i2) {
      if (y(a2), i2 !== i2 + 0) throw i2;
      v(1, 0);
    }
  }
  function Fa(e3, t2, r2, n, a2) {
    var i2 = m2();
    try {
      return Kn(e3, t2, r2, n, a2);
    } catch (u2) {
      if (y(i2), u2 !== u2 + 0) throw u2;
      v(1, 0);
    }
  }
  function qt() {
    if (J > 0) {
      ct = qt;
      return;
    }
    if (qe(), J > 0) {
      ct = qt;
      return;
    }
    function e3() {
      var t2;
      c2.calledRun = true, !Jt && (Ye(), T2(c2), (t2 = c2.onRuntimeInitialized) === null || t2 === void 0 || t2.call(c2), Ze());
    }
    c2.setStatus ? (c2.setStatus("Running..."), setTimeout(() => {
      setTimeout(() => c2.setStatus(""), 1), e3();
    }, 1)) : e3();
  }
  function ja() {
    if (c2.preInit)
      for (typeof c2.preInit == "function" && (c2.preInit = [c2.preInit]); c2.preInit.length > 0; )
        c2.preInit.shift()();
  }
  return ja(), qt(), f2 = x, f2;
};
function Be(o2) {
  return Le(Qt, o2);
}
function To(o2) {
  Be({
    overrides: o2,
    equalityFn: Object.is,
    fireImmediately: false
  });
}
async function eo(o2, f2) {
  return to(Qt, o2, f2);
}
var We = [
  ["aztec", "Aztec"],
  ["code_128", "Code128"],
  ["code_39", "Code39"],
  ["code_93", "Code93"],
  ["codabar", "Codabar"],
  ["databar", "DataBar"],
  ["databar_expanded", "DataBarExpanded"],
  ["databar_limited", "DataBarLimited"],
  ["data_matrix", "DataMatrix"],
  ["dx_film_edge", "DXFilmEdge"],
  ["ean_13", "EAN-13"],
  ["ean_8", "EAN-8"],
  ["itf", "ITF"],
  ["maxi_code", "MaxiCode"],
  ["micro_qr_code", "MicroQRCode"],
  ["pdf417", "PDF417"],
  ["qr_code", "QRCode"],
  ["rm_qr_code", "rMQRCode"],
  ["upc_a", "UPC-A"],
  ["upc_e", "UPC-E"],
  ["linear_codes", "Linear-Codes"],
  ["matrix_codes", "Matrix-Codes"],
  ["any", "Any"]
];
var ro = [...We, ["unknown"]].map((o2) => o2[0]);
var Zt = new Map(
  We
);
function no(o2) {
  for (const [f2, c2] of Zt)
    if (o2 === c2)
      return f2;
  return "unknown";
}
function ao(o2) {
  if (Ue(o2))
    return {
      width: o2.naturalWidth,
      height: o2.naturalHeight
    };
  if (Ve(o2))
    return {
      width: o2.width.baseVal.value,
      height: o2.height.baseVal.value
    };
  if (ke(o2))
    return {
      width: o2.videoWidth,
      height: o2.videoHeight
    };
  if (Ne(o2))
    return {
      width: o2.width,
      height: o2.height
    };
  if (Ge(o2))
    return {
      width: o2.displayWidth,
      height: o2.displayHeight
    };
  if (He(o2))
    return {
      width: o2.width,
      height: o2.height
    };
  if (ze(o2))
    return {
      width: o2.width,
      height: o2.height
    };
  throw new TypeError(
    "The provided value is not of type '(Blob or HTMLCanvasElement or HTMLImageElement or HTMLVideoElement or ImageBitmap or ImageData or OffscreenCanvas or SVGImageElement or VideoFrame)'."
  );
}
function Ue(o2) {
  var f2, c2;
  try {
    return o2 instanceof ((c2 = (f2 = o2 == null ? void 0 : o2.ownerDocument) == null ? void 0 : f2.defaultView) == null ? void 0 : c2.HTMLImageElement);
  } catch {
    return false;
  }
}
function Ve(o2) {
  var f2, c2;
  try {
    return o2 instanceof ((c2 = (f2 = o2 == null ? void 0 : o2.ownerDocument) == null ? void 0 : f2.defaultView) == null ? void 0 : c2.SVGImageElement);
  } catch {
    return false;
  }
}
function ke(o2) {
  var f2, c2;
  try {
    return o2 instanceof ((c2 = (f2 = o2 == null ? void 0 : o2.ownerDocument) == null ? void 0 : f2.defaultView) == null ? void 0 : c2.HTMLVideoElement);
  } catch {
    return false;
  }
}
function He(o2) {
  var f2, c2;
  try {
    return o2 instanceof ((c2 = (f2 = o2 == null ? void 0 : o2.ownerDocument) == null ? void 0 : f2.defaultView) == null ? void 0 : c2.HTMLCanvasElement);
  } catch {
    return false;
  }
}
function Ne(o2) {
  try {
    return o2 instanceof ImageBitmap || Object.prototype.toString.call(o2) === "[object ImageBitmap]";
  } catch {
    return false;
  }
}
function ze(o2) {
  try {
    return o2 instanceof OffscreenCanvas || Object.prototype.toString.call(o2) === "[object OffscreenCanvas]";
  } catch {
    return false;
  }
}
function Ge(o2) {
  try {
    return o2 instanceof VideoFrame || Object.prototype.toString.call(o2) === "[object VideoFrame]";
  } catch {
    return false;
  }
}
function oo(o2) {
  try {
    return o2 instanceof Blob || Object.prototype.toString.call(o2) === "[object Blob]";
  } catch {
    return false;
  }
}
function io(o2) {
  try {
    return o2 instanceof ImageData || Object.prototype.toString.call(o2) === "[object ImageData]";
  } catch {
    return false;
  }
}
function so(o2, f2) {
  try {
    const c2 = new OffscreenCanvas(o2, f2);
    if (c2.getContext("2d") instanceof OffscreenCanvasRenderingContext2D)
      return c2;
    throw void 0;
  } catch {
    const c2 = document.createElement("canvas");
    return c2.width = o2, c2.height = f2, c2;
  }
}
async function Xe(o2) {
  if (Ue(o2) && !await fo(o2))
    throw new DOMException(
      "Failed to load or decode HTMLImageElement.",
      "InvalidStateError"
    );
  if (Ve(o2) && !await ho(o2))
    throw new DOMException(
      "Failed to load or decode SVGImageElement.",
      "InvalidStateError"
    );
  if (Ge(o2) && po(o2))
    throw new DOMException("VideoFrame is closed.", "InvalidStateError");
  if (ke(o2) && (o2.readyState === 0 || o2.readyState === 1))
    throw new DOMException("Invalid element or state.", "InvalidStateError");
  if (Ne(o2) && yo(o2))
    throw new DOMException(
      "The image source is detached.",
      "InvalidStateError"
    );
  const { width: f2, height: c2 } = ao(o2);
  if (f2 === 0 || c2 === 0)
    return null;
  const $ = so(f2, c2).getContext("2d");
  $.drawImage(o2, 0, 0);
  try {
    return $.getImageData(0, 0, f2, c2);
  } catch {
    throw new DOMException("Source would taint origin.", "SecurityError");
  }
}
async function uo(o2) {
  let f2;
  try {
    f2 = await createImageBitmap(o2);
  } catch {
    try {
      if (globalThis.Image) {
        f2 = new Image();
        let $ = "";
        try {
          $ = URL.createObjectURL(o2), f2.src = $, await f2.decode();
        } finally {
          URL.revokeObjectURL($);
        }
      } else
        return o2;
    } catch {
      throw new DOMException(
        "Failed to load or decode Blob.",
        "InvalidStateError"
      );
    }
  }
  return await Xe(f2);
}
function co(o2) {
  const { width: f2, height: c2 } = o2;
  if (f2 === 0 || c2 === 0)
    return null;
  const T2 = o2.getContext("2d");
  try {
    return T2.getImageData(0, 0, f2, c2);
  } catch {
    throw new DOMException("Source would taint origin.", "SecurityError");
  }
}
async function lo(o2) {
  if (oo(o2))
    return await uo(o2);
  if (io(o2)) {
    if (vo(o2))
      throw new DOMException(
        "The image data has been detached.",
        "InvalidStateError"
      );
    return o2;
  }
  return He(o2) || ze(o2) ? co(o2) : await Xe(o2);
}
async function fo(o2) {
  try {
    return await o2.decode(), true;
  } catch {
    return false;
  }
}
async function ho(o2) {
  var f2;
  try {
    return await ((f2 = o2.decode) == null ? void 0 : f2.call(o2)), true;
  } catch {
    return false;
  }
}
function po(o2) {
  return o2.format === null;
}
function vo(o2) {
  return o2.data.buffer.byteLength === 0;
}
function yo(o2) {
  return o2.width === 0 && o2.height === 0;
}
function Re(o2, f2) {
  return mo(o2) ? new DOMException(`${f2}: ${o2.message}`, o2.name) : go(o2) ? new o2.constructor(`${f2}: ${o2.message}`) : new Error(`${f2}: ${o2}`);
}
function mo(o2) {
  return o2 instanceof DOMException || Object.prototype.toString.call(o2) === "[object DOMException]";
}
function go(o2) {
  return o2 instanceof Error || Object.prototype.toString.call(o2) === "[object Error]";
}
var pt;
var Eo = class {
  constructor(f2 = {}) {
    De(this, pt);
    var c2;
    try {
      const T2 = (c2 = f2 == null ? void 0 : f2.formats) == null ? void 0 : c2.filter(
        ($) => $ !== "unknown"
      );
      if ((T2 == null ? void 0 : T2.length) === 0)
        throw new TypeError("Hint option provided, but is empty.");
      for (const $ of T2 != null ? T2 : [])
        if (!Zt.has($))
          throw new TypeError(
            `Failed to read the 'formats' property from 'BarcodeDetectorOptions': The provided value '${$}' is not a valid enum value of type BarcodeFormat.`
          );
      Me(this, pt, T2 != null ? T2 : []), Be({ fireImmediately: true }).catch(() => {
      });
    } catch (T2) {
      throw Re(
        T2,
        "Failed to construct 'BarcodeDetector'"
      );
    }
  }
  static async getSupportedFormats() {
    return ro.filter((f2) => f2 !== "unknown");
  }
  async detect(f2) {
    try {
      const c2 = await lo(f2);
      if (c2 === null)
        return [];
      let T2;
      const $ = {
        tryCode39ExtendedMode: false,
        textMode: "Plain",
        formats: Ie(this, pt).map((x) => Zt.get(x))
      };
      try {
        T2 = await eo(c2, $);
      } catch (x) {
        throw console.error(x), new DOMException(
          "Barcode detection service unavailable.",
          "NotSupportedError"
        );
      }
      return T2.map((x) => {
        const {
          topLeft: { x: D2, y: R2 },
          topRight: { x: O, y: M2 },
          bottomLeft: { x: F2, y: q2 },
          bottomRight: { x: rt, y: Y2 }
        } = x.position, st = Math.min(D2, O, F2, rt), k2 = Math.min(R2, M2, q2, Y2), Z = Math.max(D2, O, F2, rt), nt = Math.max(R2, M2, q2, Y2);
        return {
          boundingBox: new DOMRectReadOnly(
            st,
            k2,
            Z - st,
            nt - k2
          ),
          rawValue: x.text,
          format: no(x.format),
          cornerPoints: [
            {
              x: D2,
              y: R2
            },
            {
              x: O,
              y: M2
            },
            {
              x: rt,
              y: Y2
            },
            {
              x: F2,
              y: q2
            }
          ]
        };
      });
    } catch (c2) {
      throw Re(
        c2,
        "Failed to execute 'detect' on 'BarcodeDetector'"
      );
    }
  }
};
pt = /* @__PURE__ */ new WeakMap();

// node_modules/barcode-detector/dist/es/polyfill.js
var e;
(e = globalThis.BarcodeDetector) != null || (globalThis.BarcodeDetector = Eo);

// node_modules/@yudiel/react-qr-scanner/dist/index.esm.mjs
function a(o2) {
  const { onClick: e3, disabled: g2, className: t2 } = o2, i2 = { cursor: g2 ? "default" : "pointer", stroke: g2 ? "grey" : "yellow", strokeLineJoin: "round", strokeLineCap: "round", strokeWidth: 1.5, ...o2.style };
  return import_react.default.createElement("svg", { onClick: g2 ? void 0 : e3, className: t2, style: i2, width: "28px", height: "28px", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg" }, import_react.default.createElement("path", { d: "M3 3L6.00007 6.00007M21 21L19.8455 19.8221M9.74194 4.06811C9.83646 4.04279 9.93334 4.02428 10.0319 4.01299C10.1453 4 10.2683 4 10.5141 4H13.5327C13.7786 4 13.9015 4 14.015 4.01299C14.6068 4.08078 15.1375 4.40882 15.4628 4.90782C15.5252 5.00345 15.5802 5.11345 15.6901 5.33333C15.7451 5.44329 15.7726 5.49827 15.8037 5.54609C15.9664 5.79559 16.2318 5.95961 16.5277 5.9935C16.5844 6 16.6459 6 16.7688 6H17.8234C18.9435 6 19.5036 6 19.9314 6.21799C20.3077 6.40973 20.6137 6.71569 20.8055 7.09202C21.0234 7.51984 21.0234 8.0799 21.0234 9.2V15.3496M19.8455 19.8221C19.4278 20 18.8702 20 17.8234 20H6.22344C5.10333 20 4.54328 20 4.11546 19.782C3.73913 19.5903 3.43317 19.2843 3.24142 18.908C3.02344 18.4802 3.02344 17.9201 3.02344 16.8V9.2C3.02344 8.0799 3.02344 7.51984 3.24142 7.09202C3.43317 6.71569 3.73913 6.40973 4.11546 6.21799C4.51385 6.015 5.0269 6.00103 6.00007 6.00007M19.8455 19.8221L14.5619 14.5619M14.5619 14.5619C14.0349 15.4243 13.0847 16 12 16C10.3431 16 9 14.6569 9 13C9 11.9153 9.57566 10.9651 10.4381 10.4381M14.5619 14.5619L10.4381 10.4381M10.4381 10.4381L6.00007 6.00007" }));
}
function B(o2) {
  const { onClick: e3, disabled: g2, className: t2 } = o2, i2 = { cursor: g2 ? "default" : "pointer", stroke: g2 ? "grey" : "yellow", strokeLineJoin: "round", strokeLineCap: "round", strokeWidth: 1.5, ...o2.style };
  return import_react.default.createElement("svg", { onClick: g2 ? void 0 : e3, className: t2, style: i2, width: "28px", height: "28px", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg" }, import_react.default.createElement("path", { d: "M12 16C13.6569 16 15 14.6569 15 13C15 11.3431 13.6569 10 12 10C10.3431 10 9 11.3431 9 13C9 14.6569 10.3431 16 12 16Z" }), import_react.default.createElement("path", { d: "M3 16.8V9.2C3 8.0799 3 7.51984 3.21799 7.09202C3.40973 6.71569 3.71569 6.40973 4.09202 6.21799C4.51984 6 5.0799 6 6.2 6H7.25464C7.37758 6 7.43905 6 7.49576 5.9935C7.79166 5.95961 8.05705 5.79559 8.21969 5.54609C8.25086 5.49827 8.27836 5.44328 8.33333 5.33333C8.44329 5.11342 8.49827 5.00346 8.56062 4.90782C8.8859 4.40882 9.41668 4.08078 10.0085 4.01299C10.1219 4 10.2448 4 10.4907 4H13.5093C13.7552 4 13.8781 4 13.9915 4.01299C14.5833 4.08078 15.1141 4.40882 15.4394 4.90782C15.5017 5.00345 15.5567 5.11345 15.6667 5.33333C15.7216 5.44329 15.7491 5.49827 15.7803 5.54609C15.943 5.79559 16.2083 5.95961 16.5042 5.9935C16.561 6 16.6224 6 16.7454 6H17.8C18.9201 6 19.4802 6 19.908 6.21799C20.2843 6.40973 20.5903 6.71569 20.782 7.09202C21 7.51984 21 8.0799 21 9.2V16.8C21 17.9201 21 18.4802 20.782 18.908C20.5903 19.2843 20.2843 19.5903 19.908 19.782C19.4802 20 18.9201 20 17.8 20H6.2C5.0799 20 4.51984 20 4.09202 19.782C3.71569 19.5903 3.40973 19.2843 3.21799 18.908C3 18.4802 3 17.9201 3 16.8Z" }));
}
function r(e3) {
  const { scanning: g2, startScanning: t2, stopScanning: i2 } = e3, [w2, n] = (0, import_react.useState)(false);
  function r2() {
    n(true), g2 ? i2() : t2(), setTimeout(() => n(false), 1e3);
  }
  return import_react.default.createElement("div", { style: { bottom: 85, right: 8, position: "absolute", zIndex: 2, cursor: w2 ? "default" : "pointer" } }, g2 ? import_react.default.createElement(a, { disabled: w2, onClick: r2 }) : import_react.default.createElement(B, { disabled: w2, onClick: r2 }));
}
function s(o2) {
  const { onClick: e3, className: g2, style: t2 } = o2;
  return import_react.default.createElement("svg", { onClick: e3, width: "30px", height: "30px", viewBox: "0 0 24 24", className: g2, style: t2, xmlns: "http://www.w3.org/2000/svg" }, import_react.default.createElement("path", { strokeWidth: 0.2, stroke: "yellow", fill: "yellow", d: "M13.225 9l5.025-7h-7.972l-3.3 11h5.359l-2.452 8.648.75.364L20.374 9zm.438 3H8.322l2.7-9H16.3l-5.025 7h7.101l-6.7 8.953z" }));
}
function C(o2) {
  const { onClick: e3, className: g2, style: t2 } = o2;
  return import_react.default.createElement("svg", { onClick: e3, width: "30px", height: "30px", viewBox: "0 0 24 24", className: g2, style: t2, xmlns: "http://www.w3.org/2000/svg" }, import_react.default.createElement("path", { strokeWidth: 0.2, stroke: "yellow", fill: "yellow", d: "M14.516 15.158l.714.714-4.595 6.14-.75-.364L12.337 13H6.978L8.22 8.861l.803.803L8.322 12h3.036l1.793 1.792-1.475 5.16zm5.984 4.05L4.793 3.5l.707-.707 3.492 3.492L10.278 2h7.972l-5.025 7h7.149l-3.71 4.957 4.543 4.543zM12.707 10l3.243 3.243L18.376 10zM9.795 7.088l2.079 2.079L16.3 3h-5.278z" }));
}
function E(o2) {
  const { status: e3, scanning: g2, torchToggle: t2 } = o2;
  function i2(A2) {
    t2(A2);
  }
  return g2 && t2 ? import_react.default.createElement("div", { style: { bottom: 35, right: 8, position: "absolute", zIndex: 2, cursor: "pointer" } }, e3 ? import_react.default.createElement(C, { onClick: () => i2(false) }) : import_react.default.createElement(s, { onClick: () => i2(true) })) : null;
}
function c(o2) {
  const { onClick: e3, className: g2, disabled: t2 = false } = o2, i2 = { cursor: t2 ? "default" : "pointer", stroke: t2 ? "grey" : "yellow", fill: t2 ? "grey" : "yellow", ...o2.style };
  return import_react.default.createElement("svg", { onClick: t2 ? void 0 : e3, width: "30px", height: "30px", viewBox: "0 0 24 24", className: g2, style: i2, xmlns: "http://www.w3.org/2000/svg" }, import_react.default.createElement("path", { strokeWidth: 0.3, d: "M16.279,17.039c-1.396,1.209 -3.216,1.941 -5.206,1.941c-4.393,0 -7.96,-3.567 -7.96,-7.96c-0,-4.393 3.567,-7.96 7.96,-7.96c4.393,0 7.96,3.567 7.96,7.96c-0,2.044 -0.772,3.909 -2.04,5.319l0.165,0.165c1.194,1.194 2.388,2.388 3.583,3.582c0.455,0.456 -0.252,1.163 -0.707,0.708l-3.755,-3.755Zm1.754,-6.019c-0,-3.841 -3.119,-6.96 -6.96,-6.96c-3.842,0 -6.96,3.119 -6.96,6.96c-0,3.841 3.118,6.96 6.96,6.96c3.841,0 6.96,-3.119 6.96,-6.96Zm-7.46,0.5l-1.5,0c-0.645,0 -0.643,-1 -0,-1l1.5,0l-0,-1.5c-0,-0.645 1,-0.643 1,0l-0,1.5l1.5,0c0.645,0 0.643,1 -0,1l-1.5,0l-0,1.5c-0,0.645 -1,0.643 -1,0l-0,-1.5Z" }));
}
function h(o2) {
  const { onClick: e3, className: g2, disabled: t2 = false } = o2, i2 = { cursor: t2 ? "default" : "pointer", stroke: t2 ? "grey" : "yellow", fill: t2 ? "grey" : "yellow", ...o2.style };
  return import_react.default.createElement("svg", { onClick: t2 ? void 0 : e3, width: "30px", height: "30px", viewBox: "0 0 24 24", className: g2, style: i2, xmlns: "http://www.w3.org/2000/svg" }, import_react.default.createElement("path", { strokeWidth: 0.3, d: "M16.279,17.039c-1.396,1.209 -3.216,1.941 -5.206,1.941c-4.393,0 -7.96,-3.567 -7.96,-7.96c-0,-4.393 3.567,-7.96 7.96,-7.96c4.393,0 7.96,3.567 7.96,7.96c-0,2.044 -0.772,3.909 -2.04,5.319l0.165,0.165c1.194,1.194 2.388,2.388 3.583,3.582c0.455,0.456 -0.252,1.163 -0.707,0.708l-3.755,-3.755Zm1.754,-6.019c-0,-3.841 -3.119,-6.96 -6.96,-6.96c-3.842,0 -6.96,3.119 -6.96,6.96c-0,3.841 3.118,6.96 6.96,6.96c3.841,0 6.96,-3.119 6.96,-6.96Zm-4.96,-0.5c0.645,0 0.643,1 -0,1l-4,0c-0.645,0 -0.643,-1 -0,-1l4,0Z" }));
}
function q(o2) {
  const { scanning: g2, capabilities: t2, onZoom: i2, value: w2 } = o2;
  if (!g2 || !i2) return null;
  const n = (t2.max - t2.min) / 3;
  return import_react.default.createElement(import_react.Fragment, null, import_react.default.createElement("div", { style: { bottom: 130, right: 8, position: "absolute", zIndex: 2, cursor: "pointer" } }, import_react.default.createElement(h, { disabled: w2 <= t2.min, onClick: function() {
    i2(Math.max(w2 - n, t2.min));
  } })), import_react.default.createElement("div", { style: { bottom: 180, right: 8, position: "absolute", zIndex: 2, cursor: "pointer" } }, import_react.default.createElement(c, { disabled: w2 >= t2.max, onClick: function() {
    i2(Math.min(w2 + n, t2.max));
  } })));
}
var l = { fullContainer: { width: "100%", height: "100%", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }, innerContainer: { width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }, overlay: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, pointerEvents: "none", display: "flex", alignItems: "center", justifyContent: "center" }, borderBox: { position: "relative", width: "70%", aspectRatio: "1 / 1", border: "2px dashed rgba(239, 68, 68, 0.4)", borderRadius: "0.5rem" }, cornerTopLeft: { position: "absolute", width: "15%", height: "15%", border: "4px solid #ef4444", top: 0, left: 0, borderBottomColor: "transparent", borderRightColor: "transparent", borderTopLeftRadius: "0.5rem" }, cornerTopRight: { position: "absolute", width: "15%", height: "15%", border: "4px solid #ef4444", top: 0, right: 0, borderBottomColor: "transparent", borderLeftColor: "transparent", borderTopRightRadius: "0.5rem" }, cornerBottomLeft: { position: "absolute", width: "15%", height: "15%", border: "4px solid #ef4444", bottom: 0, left: 0, borderTopColor: "transparent", borderRightColor: "transparent", borderBottomLeftRadius: "0.5rem" }, cornerBottomRight: { position: "absolute", width: "15%", height: "15%", border: "4px solid #ef4444", bottom: 0, right: 0, borderTopColor: "transparent", borderLeftColor: "transparent", borderBottomRightRadius: "0.5rem" } };
function M(o2) {
  const { scanning: e3, capabilities: g2, onOff: t2, torch: i2, zoom: w2, startScanning: n, stopScanning: a2 } = o2;
  return import_react.default.createElement("div", { style: l.fullContainer }, import_react.default.createElement("div", { style: l.innerContainer }, import_react.default.createElement("div", { style: l.overlay }, import_react.default.createElement("div", { style: l.borderBox }, import_react.default.createElement("div", { style: l.cornerTopLeft }), import_react.default.createElement("div", { style: l.cornerTopRight }), import_react.default.createElement("div", { style: l.cornerBottomLeft }), import_react.default.createElement("div", { style: l.cornerBottomRight }))), t2 && import_react.default.createElement(r, { scanning: e3, startScanning: n, stopScanning: a2 }), i2 && g2.torch && import_react.default.createElement(E, { scanning: e3, status: i2.status, torchToggle: i2.toggle }), w2 && g2.zoom && import_react.default.createElement(q, { scanning: e3, capabilities: g2.zoom, value: w2.value, onZoom: w2.onChange })));
}
var G = "data:audio/mp3;base64,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";
var I = (A2) => A2 instanceof Date;
var Y = (A2) => null == A2;
var D = (A2) => "object" == typeof A2;
var F = (A2) => !Y(A2) && !Array.isArray(A2) && D(A2) && !I(A2);
var T = (A2) => Y(A2) || !D(A2);
function m(A2, o2) {
  if (T(A2) || T(o2)) return A2 === o2;
  if (I(A2) && I(o2)) return A2.getTime() === o2.getTime();
  const e3 = Object.keys(A2), g2 = Object.keys(o2);
  if (e3.length !== g2.length) return false;
  for (const t2 of e3) {
    const e4 = A2[t2];
    if (!g2.includes(t2)) return false;
    if ("ref" !== t2) {
      const A3 = o2[t2];
      if (I(e4) && I(A3) || F(e4) && F(A3) || Array.isArray(e4) && Array.isArray(A3) ? !m(e4, A3) : e4 !== A3) return false;
    }
  }
  return true;
}
var V = { facingMode: "environment", width: { min: 640, ideal: 720, max: 1920 }, height: { min: 640, ideal: 720, max: 1080 } };
var Q = { finder: true, torch: true, tracker: void 0, onOff: false, zoom: false };
var R = { width: "100%", height: "100%", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", aspectRatio: "1/1" };
var d = { width: "100%", height: "100%", objectFit: "cover", overflow: "hidden" };
function N(A2, o2) {
  for (const e3 of A2) {
    const [A3, ...g2] = e3.cornerPoints;
    o2.lineWidth = 2, o2.strokeStyle = "yellow", o2.beginPath(), o2.moveTo(A3.x, A3.y);
    for (const { x: A4, y: e4 } of g2) o2.lineTo(A4, e4);
    o2.lineTo(A3.x, A3.y), o2.closePath(), o2.stroke();
  }
}
function f(A2, o2) {
  for (const e3 of A2) {
    const { boundingBox: { x: A3, y: g2, width: t2, height: i2 } } = e3;
    o2.lineWidth = 2, o2.strokeStyle = "yellow", o2.strokeRect(A3, g2, t2, i2);
  }
}
function u(A2, o2) {
  A2.forEach((A3) => {
    const { boundingBox: e3, rawValue: g2 } = A3, t2 = e3.x + e3.width / 2, i2 = e3.y + e3.height / 2, w2 = Math.max(12, 50 * e3.width / o2.canvas.width), n = w2;
    let a2;
    o2.font = `${w2}px sans-serif`, o2.textAlign = "left";
    try {
      a2 = JSON.stringify(JSON.parse(g2), null, 2);
    } catch (A4) {
      a2 = g2;
    }
    const B2 = a2.split("\n"), r2 = Math.max(...B2.map((A4) => o2.measureText(A4).width)), s2 = B2.length * n, C2 = t2 - r2 / 2 - 10, E2 = i2 - s2 / 2 - 10, c2 = r2 + 20, h2 = s2 + 10;
    o2.beginPath(), o2.moveTo(C2 + 8, E2), o2.lineTo(C2 + c2 - 8, E2), o2.quadraticCurveTo(C2 + c2, E2, C2 + c2, E2 + 8), o2.lineTo(C2 + c2, E2 + h2 - 8), o2.quadraticCurveTo(C2 + c2, E2 + h2, C2 + c2 - 8, E2 + h2), o2.lineTo(C2 + 8, E2 + h2), o2.quadraticCurveTo(C2, E2 + h2, C2, E2 + h2 - 8), o2.lineTo(C2, E2 + 8), o2.quadraticCurveTo(C2, E2, C2 + 8, E2), o2.closePath(), o2.fillStyle = "rgba(255, 255, 0, 0.9)", o2.fill(), B2.forEach((A4, e4) => {
      const g3 = i2 + e4 * n - (B2.length - 1) * n / 2;
      let w3 = t2 - r2 / 2, a3 = 0;
      const s3 = [...A4.matchAll(/"([^"]+)":/g)], C3 = [...A4.matchAll(/:\s*("[^"]*"|\d+|true|false|null)/g)];
      s3.forEach((e5, t3) => {
        var i3, n2;
        const B3 = e5[0].replace(":", ""), r3 = A4.substring(a3, e5.index);
        if (o2.fillStyle = "black", o2.fillText(r3, w3, g3), w3 += o2.measureText(r3).width, o2.fillStyle = "blue", o2.fillText(B3, w3, g3), w3 += o2.measureText(B3).width, a3 = e5.index + B3.length, o2.fillStyle = "black", o2.fillText(": ", w3, g3), w3 += o2.measureText(": ").width, t3 < C3.length) {
          const e6 = C3[t3], B4 = A4.substring(a3, e6.index);
          o2.fillStyle = "black", o2.fillText(B4, w3, g3), w3 += o2.measureText(B4).width;
          const r4 = null !== (n2 = null === (i3 = e6[0].match(/:\s*(.*)/)) || void 0 === i3 ? void 0 : i3[1]) && void 0 !== n2 ? n2 : "";
          o2.fillStyle = "green", o2.fillText(r4, w3, g3), w3 += o2.measureText(r4).width, a3 = e6.index + e6[0].length;
        }
      }), o2.fillStyle = "black";
      const E3 = A4.substring(a3);
      o2.fillText(E3, w3, g3);
    });
  });
}
function p(A2) {
  if (null === A2) throw new Error("Canvas should always be defined when component is mounted.");
  const o2 = A2.getContext("2d");
  if (null === o2) throw new Error("Canvas 2D context should be non-null");
  o2.clearRect(0, 0, A2.width, A2.height);
}
function k(e3) {
  var a2;
  const { onScan: B2, constraints: r2, formats: s2 = ["qr_code"], paused: C2 = false, components: E2, children: c2, styles: h2, classNames: q2, allowMultiple: l2, scanDelay: I2, onError: Y2, sound: D2 } = e3, F2 = (0, import_react.useRef)(null), T2 = (0, import_react.useRef)(null), N2 = (0, import_react.useRef)(null), f2 = (0, import_react.useMemo)(() => ({ ...V, ...r2 }), [r2]), u2 = (0, import_react.useMemo)(() => ({ ...Q, ...E2 }), [E2]), [k2, K2] = (0, import_react.useState)(false), [y, L] = (0, import_react.useState)(true), [J, x] = (0, import_react.useState)(f2), U = function() {
    const A2 = (0, import_react.useRef)(Promise.resolve({ type: "stop", data: {} })), e4 = (0, import_react.useRef)(null), w2 = (0, import_react.useRef)(null), [n, a3] = (0, import_react.useState)({}), [B3, r3] = (0, import_react.useState)({}), s3 = (0, import_react.useCallback)(async (A3, o2) => {
      var g2, t2, i2;
      if (!window.isSecureContext) throw new Error("camera access is only permitted in secure context. Use HTTPS or localhost rather than HTTP.");
      if (void 0 === (null === (g2 = null === navigator || void 0 === navigator ? void 0 : navigator.mediaDevices) || void 0 === g2 ? void 0 : g2.getUserMedia)) throw new Error("this browser has no Stream API support");
      const n2 = await navigator.mediaDevices.getUserMedia({ audio: false, video: o2 });
      void 0 !== A3.srcObject ? A3.srcObject = n2 : void 0 !== A3.mozSrcObject ? A3.mozSrcObject = n2 : window.URL.createObjectURL ? A3.src = window.URL.createObjectURL(n2) : window.webkitURL ? A3.src = window.webkitURL.createObjectURL(n2) : A3.src = n2.id, await Promise.race([A3.play(), new Promise((A4) => setTimeout(A4, 3e3)).then(() => {
        throw new Error("Loading camera stream timed out after 3 seconds.");
      })]), await new Promise((A4) => setTimeout(A4, 500));
      const [B4] = n2.getVideoTracks();
      return r3(B4.getSettings()), a3(null !== (i2 = null === (t2 = null == B4 ? void 0 : B4.getCapabilities) || void 0 === t2 ? void 0 : t2.call(B4)) && void 0 !== i2 ? i2 : {}), e4.current = n2, w2.current = B4, { type: "start", data: { videoEl: A3, stream: n2, constraints: o2 } };
    }, []), C3 = (0, import_react.useCallback)(async (A3, o2) => {
      A3.src = "", A3.srcObject = null, A3.load();
      for (const A4 of o2.getTracks()) o2.removeTrack(A4), A4.stop();
      return e4.current = null, w2.current = null, r3({}), { type: "stop", data: {} };
    }, []), E3 = (0, import_react.useCallback)(async (o2, { constraints: e5, restart: g2 = false }) => {
      if (A2.current = A2.current.then((A3) => {
        if ("start" === A3.type) {
          const { data: { videoEl: t2, stream: i2, constraints: w3 } } = A3;
          return g2 || o2 !== t2 || e5 !== w3 ? C3(t2, i2).then(() => s3(o2, e5)) : A3;
        }
        return s3(o2, e5);
      }), "stop" === (await A2.current).type) throw new Error("Something went wrong with the camera task queue (start task).");
    }, [s3, C3]), c3 = (0, import_react.useCallback)(async () => {
      if (A2.current = A2.current.then((A3) => {
        if ("stop" === A3.type) return A3;
        const { data: { videoEl: o2, stream: e5 } } = A3;
        return C3(o2, e5);
      }), "start" === (await A2.current).type) throw new Error("Something went wrong with the camera task queue (stop task).");
    }, [C3]), h3 = (0, import_react.useCallback)(async (A3) => {
      const o2 = w2.current;
      if (!o2) throw new Error("No active video track found.");
      {
        A3.advanced && A3.advanced[0].zoom && o2.getCapabilities().torch && await o2.applyConstraints({ advanced: [{ torch: false }] }), await o2.applyConstraints(A3);
        const e5 = o2.getCapabilities(), g2 = o2.getSettings();
        a3(e5), r3(g2);
      }
    }, []);
    return (0, import_react.useEffect)(() => () => {
      (async () => {
        await c3();
      })();
    }, [c3]), { capabilities: n, settings: B3, startCamera: E3, stopCamera: c3, updateConstraints: h3 };
  }(), { startScanning: Z, stopScanning: W } = function(A2) {
    const { videoElementRef: o2, onScan: e4, onFound: w2, retryDelay: a3 = 100, scanDelay: B3 = 0, formats: r3 = [], allowMultiple: s3 = false, sound: C3 = true } = A2, E3 = (0, import_react.useRef)(new Eo({ formats: r3 })), c3 = (0, import_react.useRef)(null), h3 = (0, import_react.useRef)(null);
    (0, import_react.useEffect)(() => {
      E3.current = new Eo({ formats: r3 });
    }, [r3]), (0, import_react.useEffect)(() => {
      "undefined" != typeof window && C3 && (c3.current = new Audio("string" == typeof C3 ? C3 : G));
    }, [C3]);
    const q3 = (0, import_react.useCallback)((A3) => async (g2) => {
      if (null !== o2.current && o2.current.readyState > 1) {
        const { lastScan: t2, contentBefore: i2, lastScanHadContent: n } = A3;
        if (g2 - t2 < a3) h3.current = window.requestAnimationFrame(q3(A3));
        else {
          const t3 = await E3.current.detect(o2.current), a4 = t3.some((A4) => !i2.includes(A4.rawValue)), r4 = t3.length > 0;
          let l3 = A3.lastOnScan;
          (a4 || s3 && r4 && g2 - l3 >= B3) && (C3 && c3.current && c3.current.paused && c3.current.play().catch((A4) => console.error("Error playing the sound", A4)), l3 = g2, e4(t3)), r4 && w2(t3), !r4 && n && w2(t3);
          const M2 = { lastScan: g2, lastOnScan: l3, lastScanHadContent: r4, contentBefore: a4 ? t3.map((A4) => A4.rawValue) : i2 };
          h3.current = window.requestAnimationFrame(q3(M2));
        }
      }
    }, [o2.current, e4, w2, a3]);
    return { startScanning: (0, import_react.useCallback)(() => {
      const A3 = performance.now(), o3 = { lastScan: A3, lastOnScan: A3, contentBefore: [], lastScanHadContent: false };
      h3.current = window.requestAnimationFrame(q3(o3));
    }, [q3]), stopScanning: (0, import_react.useCallback)(() => {
      null !== h3.current && (window.cancelAnimationFrame(h3.current), h3.current = null);
    }, []) };
  }({ videoElementRef: F2, onScan: B2, onFound: (A2) => function(A3, o2, e4, g2) {
    const t2 = e4;
    if (null == t2) throw new Error("onFound handler should only be called when component is mounted. Thus tracking canvas is always defined.");
    const i2 = o2;
    if (null == i2) throw new Error("onFound handler should only be called when component is mounted. Thus video element is always defined.");
    if (0 === A3.length || void 0 === g2) p(t2);
    else {
      const o3 = i2.offsetWidth, e5 = i2.offsetHeight, w2 = i2.videoWidth, n = i2.videoHeight, a3 = Math.max(o3 / w2, e5 / n), B3 = w2 * a3, r3 = n * a3, s3 = B3 / w2, C3 = r3 / n, E3 = (o3 - B3) / 2, c3 = (e5 - r3) / 2, h3 = ({ x: A4, y: o4 }) => ({ x: Math.floor(A4 * s3), y: Math.floor(o4 * C3) }), q3 = ({ x: A4, y: o4 }) => ({ x: Math.floor(A4 + E3), y: Math.floor(o4 + c3) }), l3 = A3.map((A4) => {
        const { boundingBox: o4, cornerPoints: e6 } = A4, { x: g3, y: t3 } = q3(h3({ x: o4.x, y: o4.y })), { x: i3, y: w3 } = h3({ x: o4.width, y: o4.height });
        return { ...A4, cornerPoints: e6.map((A5) => q3(h3(A5))), boundingBox: DOMRectReadOnly.fromRect({ x: g3, y: t3, width: i3, height: w3 }) };
      });
      t2.width = i2.offsetWidth, t2.height = i2.offsetHeight;
      const M2 = t2.getContext("2d");
      if (null === M2) throw new Error("onFound handler should only be called when component is mounted. Thus tracking canvas 2D context is always defined.");
      g2(l3, M2);
    }
  }(A2, F2.current, N2.current, u2.tracker), formats: s2, retryDelay: void 0 === u2.tracker ? 500 : 10, scanDelay: I2, allowMultiple: l2, sound: D2 });
  (0, import_react.useEffect)(() => (K2(true), () => {
    K2(false);
  }), []), (0, import_react.useEffect)(() => {
    k2 && (W(), Z());
  }, [null == E2 ? void 0 : E2.tracker]), (0, import_react.useEffect)(() => {
    if (!m(f2, J)) {
      const A2 = f2;
      (null == r2 ? void 0 : r2.deviceId) && delete A2.facingMode, x(A2);
    }
  }, [r2]);
  const v = (0, import_react.useMemo)(() => ({ constraints: J, shouldStream: k2 && !C2 }), [J, k2, C2]), b = async () => {
    const A2 = F2.current;
    if (null == A2) throw new Error("Video should be defined when component is mounted.");
    const o2 = T2.current;
    if (null == o2) throw new Error("Canvas should be defined when component is mounted.");
    const e4 = o2.getContext("2d");
    if (null == e4) throw new Error("Canvas should be defined when component is mounted.");
    if (v.shouldStream) {
      await U.stopCamera(), L(false);
      try {
        await U.startCamera(A2, v), A2 ? L(true) : await U.stopCamera();
      } catch (A3) {
        null == Y2 || Y2(A3), console.error("error", A3);
      }
    } else o2.width = A2.videoWidth, o2.height = A2.videoHeight, e4.drawImage(A2, 0, 0, A2.videoWidth, A2.videoHeight), await U.stopCamera(), L(false);
  };
  (0, import_react.useEffect)(() => {
    (async () => {
      await b();
    })();
  }, [v]);
  const O = (0, import_react.useMemo)(() => v.shouldStream && y, [v.shouldStream, y]);
  return (0, import_react.useEffect)(() => {
    if (O) {
      if (void 0 === T2.current) throw new Error("shouldScan effect should only be triggered when component is mounted. Thus pause frame canvas is defined");
      if (p(T2.current), void 0 === N2.current) throw new Error("shouldScan effect should only be triggered when component is mounted. Thus tracking canvas is defined");
      p(N2.current);
      const A2 = F2.current;
      if (null == A2) throw new Error("shouldScan effect should only be triggered when component is mounted. Thus video element is defined");
      Z();
    }
  }, [O]), import_react.default.createElement("div", { style: { ...R, ...null == h2 ? void 0 : h2.container }, className: null == q2 ? void 0 : q2.container }, import_react.default.createElement("video", { ref: F2, style: { ...d, ...null == h2 ? void 0 : h2.video, visibility: C2 ? "hidden" : "visible" }, className: null == q2 ? void 0 : q2.video, autoPlay: true, muted: true, playsInline: true }), import_react.default.createElement("canvas", { ref: T2, style: { display: C2 ? "block" : "none", position: "absolute", width: "100%", height: "100%" } }), import_react.default.createElement("canvas", { ref: N2, style: { position: "absolute", width: "100%", height: "100%" } }), import_react.default.createElement("div", { style: { position: "absolute", width: "100%", height: "100%" } }, u2.finder && import_react.default.createElement(M, { scanning: y, capabilities: U.capabilities, onOff: u2.onOff, zoom: u2.zoom && U.settings.zoom ? { value: U.settings.zoom, onChange: async (A2) => {
    const o2 = { ...J, advanced: [{ zoom: A2 }] };
    await U.updateConstraints(o2);
  } } : void 0, torch: u2.torch ? { status: null !== (a2 = U.settings.torch) && void 0 !== a2 && a2, toggle: async (A2) => {
    const o2 = { ...J, advanced: [{ torch: A2 }] };
    await U.updateConstraints(o2);
  } } : void 0, startScanning: async () => await b(), stopScanning: async () => {
    await U.stopCamera(), p(N2.current), L(false);
  } }), c2));
}
function K() {
  const [A2, e3] = (0, import_react.useState)([]);
  return (0, import_react.useEffect)(() => {
    (async () => {
      e3(await async function() {
        return (await navigator.mediaDevices.enumerateDevices()).filter(({ kind: A3 }) => "videoinput" === A3);
      }());
    })();
  }, []), A2;
}
export {
  k as Scanner,
  f as boundingBox,
  u as centerText,
  N as outline,
  Be as prepareZXingModule,
  To as setZXingModuleOverrides,
  K as useDevices
};
//# sourceMappingURL=@yudiel_react-qr-scanner.js.map
