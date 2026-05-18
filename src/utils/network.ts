export function getSubnet(ip: string | null | undefined) {
  return ip ? ip.split(".").slice(0, 3).join(".") : null;
}

export async function getLocalIP() {
  if (typeof window === "undefined" || !("RTCPeerConnection" in window)) {
    return null;
  }

  return new Promise<string | null>((resolve) => {
    const connection = new RTCPeerConnection({ iceServers: [] });
    connection.createDataChannel("");

    connection.onicecandidate = (event) => {
      const candidate = event.candidate?.candidate;
      if (!candidate) {
        resolve(null);
        connection.close();
        return;
      }

      const match = candidate.match(/(\d+\.\d+\.\d+\.\d+)/);
      const ip = match?.[1] ?? null;
      if (ip && (ip.startsWith("192.168.") || ip.startsWith("10.") || ip.startsWith("172."))) {
        resolve(ip);
        connection.close();
      }
    };

    connection
      .createOffer()
      .then((offer) => connection.setLocalDescription(offer))
      .catch(() => resolve(null));

    window.setTimeout(() => {
      resolve(null);
      connection.close();
    }, 3_000);
  });
}

export function hasSameSubnet(currentSubnet: string | null, targetSubnet: string | null) {
  return Boolean(currentSubnet && targetSubnet && currentSubnet === targetSubnet);
}
