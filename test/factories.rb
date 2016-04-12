FactoryGirl.define do  factory :image do
    image "MyString"
map_id 1
layer 1
x_pos 1
y_pos 1
  end

  factory :convention do
    name "ToC"
    start_date 1.year.ago
    end_date 1.year.ago.tomorrow
  end

  factory :map do
    association :convention
    name "Gym"
    width 500
    height 500
  end

  factory :vendor do
    association :convention
    name "Google"
    description "Google Inc. is an American multinational technology company specializing in Internet-related services and products."
    website_url "www.google.com"
  end

  factory :booth do
    association :map
    x_pos 5
    y_pos 5
    width 10
    height 10
  end

  factory :vendor_booth do
    association :vendor
    association :booth
  end

  factory :tag do
    association :convention
    name "Internship"
  end

  factory :vendor_tag do
    association :vendor
    association :tag
  end
end
