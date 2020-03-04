const peerjs = require("peerjs/lib/exports");
const Peer = peerjs.default;

module.exports = function (RED) {

	function WebRtcNodeIn(config) {

		RED.nodes.createNode(this, config);

		this.status({ fill: "grey", shape: "ring", text: "Starting" });

		if (config.peerIdIn === null || config.peerIdIn.trim() === "") {
			this.status({ fill: "red", shape: "ring", text: "No PeerID" });
			return;
		}

		// Create the peer with the specific ID
		const peer = new Peer(config.peerIdIn);

		const Listen = () => {

			this.status({ fill: "red", shape: "ring", text: "disconnected" });

			const prepareMessage = (device) => {
				return {
					payload: device
				};
			};

			peer.on("connection", (connection) => {

				connection.on("data", (data) => {

					this.send(prepareMessage(data));
				});

				connection.on("open", () => {

					this.status({ fill: "green", shape: "dot", text: "connected" });
				});

				connection.on("close", () => {

					this.status({ fill: "red", shape: "ring", text: "closed" });
				});

				connection.on("error", err => {
					
					console.warn(err);
				});

				this.on("close", (done) => {
					peer.disconnect();
					done();
				});
			});
		};

		Listen();
	}

	RED.nodes.registerType("webrtc-in", WebRtcNodeIn);
}