json.array!(@vendors) do |vendor|
  json.extract! vendor, :id, :name, :convention_id, :description, :website_url
  json.url vendor_url(vendor, format: :json)
end
