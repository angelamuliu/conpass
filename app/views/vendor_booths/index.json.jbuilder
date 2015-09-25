json.array!(@vendor_booths) do |vendor_booth|
  json.extract! vendor_booth, :id, :vendor_id, :booth_id, :start_time, :end_time
  json.url vendor_booth_url(vendor_booth, format: :json)
end
