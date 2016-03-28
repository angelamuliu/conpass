json.array!(@associates) do |associate|
  json.extract! associate, :id, :vendor_id, :first_name, :last_name
  json.url associate_url(associate, format: :json)
end
