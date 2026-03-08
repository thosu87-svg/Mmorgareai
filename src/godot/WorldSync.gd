extends Node

@export var world_environment: WorldEnvironment
@export var sun_light: DirectionalLight3D

func update_environment(civilization_index: float):
	# Deterministic environment adjustments based on CI
	# Higher CI = brighter, more saturated world
	
	var energy = clamp(civilization_index / 1000.0, 0.5, 2.0)
	sun_light.light_energy = energy
	
	var sky_color = Color(0.1, 0.1, 0.5).lerp(Color(0.4, 0.8, 1.0), civilization_index / 2000.0)
	# Assuming a procedural sky
	if world_environment.environment.sky:
		world_environment.environment.sky.sky_material.set_shader_parameter("sky_top_color", sky_color)
	
	print("World Sync: CI ", civilization_index, " Energy set to ", energy)
