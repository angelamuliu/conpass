class CreateLocations < ActiveRecord::Migration
  def change
    create_table :locations do |t|
      t.integer :convention_id
      t.string :address_1
      t.string :address_2
      t.string :city
      t.string :state
      t.string :zip
      t.string :country
      t.float :latitude
      t.float :longitude

      t.timestamps
    end
  end
end
