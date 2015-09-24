json.array!(@conventions) do |convention|
  json.extract! convention, :id, :name, :start_date, :end_date
  json.url convention_url(convention, format: :json)
end
