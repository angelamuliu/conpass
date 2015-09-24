json.array!(@booths) do |booth|
  json.extract! booth, :id, :start_time, :end_time, :vendor_id, :x_pos, :y_pos, :width, :height
  json.url booth_url(booth, format: :json)
end
