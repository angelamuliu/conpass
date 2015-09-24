json.array!(@tags) do |tag|
  json.extract! tag, :id, :convention_id, :name
  json.url tag_url(tag, format: :json)
end
