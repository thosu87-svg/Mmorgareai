extends Node

# A simple GDScript connector for Axiom Frontier
# Using REST API endpoints for Firebase Auth and Firestore

var api_key = "AIzaSyDldbhESThtDQ3YYIPmLEh-cocereahAOE"
var project_id = "studio-5485353702-8ce01"
var auth_token = ""
var user_id = ""

func sign_in_anonymous():
	var url = "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=" + api_key
	var body = JSON.stringify({"returnSecureToken": true})
	var http = HTTPRequest.new()
	add_child(http)
	http.request_completed.connect(_on_auth_completed)
	http.request(url, ["Content-Type: application/json"], HTTPClient.METHOD_POST, body)

func _on_auth_completed(result, response_code, headers, body):
	var json = JSON.parse_string(body.get_string_from_utf8())
	if response_code == 200:
		auth_token = json.idToken
		user_id = json.localId
		print("Authenticated as: ", user_id)
		# Start syncing positions
		get_parent().get_node("NetworkManager").start_sync()
	else:
		print("Auth Error: ", json.error.message)

func get_world_state():
	var url = "https://firestore.googleapis.com/v1/projects/" + project_id + "/databases/(default)/documents/worldState/global"
	var http = HTTPRequest.new()
	add_child(http)
	http.request_completed.connect(_on_world_state_received)
	http.request(url, ["Authorization: Bearer " + auth_token])

func _on_world_state_received(result, response_code, headers, body):
	var json = JSON.parse_string(body.get_string_from_utf8())
	if response_code == 200:
		var fields = json.fields
		var ci = fields.civilizationIndex.doubleValue
		# Update world visuals
		get_parent().get_node("WorldSync").update_environment(ci)
