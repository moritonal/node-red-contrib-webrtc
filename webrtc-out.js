const peerjs = require("peerjs/lib/exports");
const Peer = peerjs.default;

module.exports = function (RED) {

	function WebRtcNodeOut(config) {

		RED.nodes.createNode(this, config);

		this.status({ fill: "grey", shape: "ring", text: "Starting" });

		if (config.peerID === null || config.peerID.trim() === "") {
			this.status({ fill: "red", shape: "ring", text: "No PeerID" });
			return;
		}

		// The `in` doesn't require an ID because nothing connects to it.
		const peer = new Peer(null);

		/*peer.on("error", (err) => {
			console.warn(err);
		});*/

		const Connect = () => {

			const connection = peer.connect(config.peerID, {
				serialization: "json"
			});

			if (connection) {

				connection.on("open", () => {

					this.status({ fill: "green", shape: "dot", text: "connected" });

					this.on("input", (msg) => {
						connection.send(msg.payload);
					});
				});

				connection.on("close", () => {

					this.status({ fill: "red", shape: "ring", text: "closed" });

					// If the connection closes, try again in a second.
					setTimeout(() => {
						Connect();
					}, 1000);
				});

				connection.on("error", err => {
					console.warn(err);
				});

			} else {
				setTimeout(() => {
					Connect();
				}, 1000);
			}
		}

		// Wait slightly for situations where the `out` is on the same Node-RED as in the `in`.
		const timeout = setTimeout(() => {
			Connect();
		}, 500);

		this.on("close", (done) => {

			clearTimeout(timeout);

			peer.disconnect();

			done();
		});
	}

	RED.nodes.registerType("webrtc-out", WebRtcNodeOut);
}