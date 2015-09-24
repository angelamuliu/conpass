json.array!(@maps) do |map|
  json.extract! map, :id, :convention_id, :name, :start_date, :end_date
  json.url map_url(map, format: :json)
end
