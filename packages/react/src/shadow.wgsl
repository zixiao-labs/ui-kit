struct Params {
  size: vec2f,
  radius: f32,
  opacity: f32,
}
@group(0) @binding(0) var<uniform> params: Params;

fn rounded_box(p: vec2f) -> f32 {
  let half_size = params.size * 0.5;
  let radius = min(params.radius, min(half_size.x, half_size.y));
  let q = abs(p) - half_size + radius;
  return length(max(q, vec2f(0.0))) + min(max(q.x, q.y), 0.0) - radius;
}

@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  // 48 CSS pixels of transparent room on each side; resolution is DPR-independent.
  let p = (uv - 0.5) * (params.size + 96.0);
  let outside = smoothstep(-0.5, 0.5, rounded_box(p));
  let ambient = max(rounded_box(p - vec2f(0.0, 10.0)), 0.0) / 14.0;
  let contact = max(rounded_box(p - vec2f(0.0, 2.0)), 0.0) / 3.0;
  let alpha = (exp(-ambient * ambient * 0.5) * 0.7
    + exp(-contact * contact * 0.5) * 0.3) * params.opacity * outside;
  return vec4f(0.0, 0.0, 0.0, alpha);
}
