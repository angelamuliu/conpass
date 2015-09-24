json.array!(@vendor_tags) do |vendor_tag|
  json.extract! vendor_tag, :id, :vendor_id, :tag_id
  json.url vendor_tag_url(vendor_tag, format: :json)
end
