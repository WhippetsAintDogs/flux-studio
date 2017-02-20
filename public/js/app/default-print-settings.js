define(function() {
    return {
        custom: `avoid_crossing_perimeters = 0
before_layer_gcode =
bottom_solid_layers = 3
bridge_acceleration = 0
bridge_fan_speed = 100
bridge_flow_ratio = 1
bridge_speed = 60
brim_width = 0
complete_objects = 0
cooling = 1
default_acceleration = 0
detect_filament_runout = 1
detect_head_tilt = 1
flux_calibration = 1
disable_fan_first_layers = 3
dont_support_bridges = 1
duplicate_distance = 6
end_gcode = G91\\nG1 E-20 F300\\nM104 S0\\nG90\\nM84\\n
external_fill_pattern = rectilinear
external_perimeter_extrusion_width = 0.4
external_perimeter_speed = 28
external_perimeters_first = 0
extra_perimeters = 1
extruder_clearance_height = 20
extruder_clearance_radius = 20
extrusion_axis = E
extrusion_multiplier = 1
extrusion_width = 0.4
fan_always_on = 0
fan_below_layer_time = 99
filament_colour = #FFFFFF
filament_diameter = 1.75
fill_angle = 45
fill_density = 20%
fill_pattern = honeycomb
first_layer_acceleration = 0
first_layer_bed_temperature = 0
first_layer_extrusion_width = 125%
first_layer_height = 0.4
first_layer_speed = 20
first_layer_temperature = 230
gap_fill_speed = 20
gcode_arcs = 0
gcode_comments = 0
gcode_flavor = reprap
geometric_error_correction_on = 1
infill_acceleration = 0
infill_every_layers = 1
infill_extruder = 1
infill_extrusion_width = 0.4
infill_first = 0
infill_only_where_needed = 0
infill_overlap = 30%
infill_speed = 60
interface_shells = 0
layer_gcode =
layer_height = 0.15
max_fan_speed = 100
max_print_speed = 80
max_volumetric_speed = 0
min_print_speed = 3
min_skirt_length = 0
notes =
nozzle_diameter = 0.4
only_retract_when_crossing_perimeters = 1
ooze_prevention = 0
overhangs = 0
pause_at_layers =
perimeter_acceleration = 0
perimeter_extruder = 1
perimeter_extrusion_width = 0.4
perimeter_speed = 40
perimeters = 3
post_process =
pressure_advance = 0
raft = 1
raft_layers = 4
resolution = 0.01
retract_before_travel = 2
retract_layer_change = 0
retract_length = 8
retract_length_toolchange = 10
retract_lift = 0.15
retract_restart_extra = 0
retract_restart_extra_toolchange = 0
retract_speed = 80
seam_position = aligned
skirt_distance = 10
skirt_height = 1
skirts = 2
slowdown_below_layer_time = 15
small_perimeter_speed = 15
solid_infill_below_area = 1
solid_infill_every_layers = 0
solid_infill_extruder = 1
solid_infill_extrusion_width = 0.4
solid_infill_speed = 20
spiral_vase = 0
standby_temperature_delta = -5
start_gcode = G1 Z5 F5000 ; lift nozzle;\\nG92 Z4.9
support_everywhere = 0
support_material = 0
support_material_angle = 0
support_material_contact_distance = 0.3
support_material_enforce_layers = 0
support_material_extruder = 1
support_material_extrusion_width = 0.4
support_material_interface_extruder = 1
support_material_interface_layers = 3
support_material_interface_spacing = 0
support_material_interface_speed = 100%
support_material_pattern = LINES
support_material_spacing = 1.7
support_material_speed = 40
support_material_threshold = 37
temperature = 215
thin_walls = 1
threads = 4
toolchange_gcode =
top_infill_extrusion_width = 0.27
top_solid_infill_speed = 15
top_solid_layers = 4
travel_speed = 80
use_firmware_retraction = 0
use_relative_e_distances = 0
use_volumetric_e = 0
vibration_limit = 0
wipe = 0
xy_size_compensation = -0.07
z_offset = 0`,
    fd1p: {
        high: {
            "layer_height": 0.075,
            "travel_speed": 120,
            "infill_speed": 60,
            "retract_lift" : 0.05,
            "temperature": 200,
            "perimeter_speed": 50,
            "external_perimeter_speed": 35,
            "first_layer_temperature": 230
        },
        med: {
            "layer_height": 0.15,
            "travel_speed": 150,
            "infill_speed": 60,
            "retract_lift" : 0.05,
            "temperature": 200,
            "perimeter_speed": 50,
            "external_perimeter_speed": 35,
            "first_layer_temperature": 230
        },
        low: {
            "layer_height": 0.3,
            "travel_speed": 150,
            "infill_speed": 60,
            "retract_lift" : 0.05,
            "temperature": 200,
            "perimeter_speed": 50,
            "external_perimeter_speed": 35,
            "first_layer_temperature": 230
        }
    },
    fd1: {
        high: {
            "layer_height": 0.075,
            "travel_speed": 80,
            "infill_speed": 60,
            "retract_lift" : 0.24,
            "temperature": 215,
            "perimeter_speed": 40,
            "external_perimeter_speed": 28,
            "first_layer_temperature": 230
        },
        med: {
            "layer_height": 0.15,
            "travel_speed": 100,
            "infill_speed": 60,
            "retract_lift" : 0.24,
            "temperature": 215,
            "perimeter_speed": 40,
            "external_perimeter_speed": 28,
            "first_layer_temperature": 230
        },
        low: {
            "layer_height": 0.3,
            "travel_speed": 120,
            "infill_speed": 30,
            "retract_lift" : 0.24,
            "temperature": 215,
            "perimeter_speed": 40,
            "external_perimeter_speed": 28,
            "first_layer_temperature": 230
        }
    }
  }
});
