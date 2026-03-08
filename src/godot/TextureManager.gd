extends Node

# Manages dynamic texture application from Firebase Storage
# assignments are read from Firestore /assets collection

func apply_texture_to_mesh(mesh_node: MeshInstance3D, asset_id: String):
	# 1. Fetch asset metadata from Firestore
	# 2. Download from Storage URL
	# 3. Create ImageTexture and apply to material
	pass

func _load_external_texture(path: String, mesh_node: MeshInstance3D):
	var img = Image.load_from_file(path)
	var tex = ImageTexture.create_from_image(img)
	var mat = mesh_node.get_active_material(0)
	if mat is StandardMaterial3D:
		mat.albedo_texture = tex
