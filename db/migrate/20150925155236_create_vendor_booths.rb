class CreateVendorBooths < ActiveRecord::Migration
  def change
    create_table :vendor_booths do |t|
      t.integer :vendor_id
      t.integer :booth_id
      t.datetime :start_time
      t.datetime :end_time

      t.timestamps
    end
  end
end
