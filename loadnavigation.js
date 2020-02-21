(function() {
	var httpRequest;
	
	function makeRequest(accessFile) {
		httpRequest = new XMLHttpRequest();
		
		if (!httpRequest) {
			return false;
		}
		// We're good - Exchange data:
		httpRequest.onreadystatechange = recieveContents;
		httpRequest.open("GET", accessFile);
		httpRequest.send(); // send the request
	}
	function recieveContents() {
		// Handle response of HTTP request:
		if (httpRequest.readyState === XMLHttpRequest.DONE) { // === 4
			// Yay! We're ready!
			if (httpRequest.status === 200) {
				// No errors!
				var xmldoc = httpRequest.responseXML; // store the xml file
				var root_node = xmldoc.getElementsByTagName("root")[0]; // transferse the xml dom to find the <root> tag
				// Add the header and footer code
				document.body.insertBefore(root_node.children[0], document.body.children[0]); // at the beginning
				 // not sure why but root_node.children[0] is now the footer event though it is [0] index again
				document.body.appendChild(root_node.children[0]); // at the end
			} else {
				console.log("Error "+httpRequest.status);
			}
		}
	};
	
	makeRequest("navigation.xml");
	console.log("Request sent to navigation.xml for header/footer.");
})();