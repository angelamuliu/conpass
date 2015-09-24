class CreateVendors < ActiveRecord::Migration
  def change
    create_table :vendors do |t|
      t.string :name
      t.integer :convention_id
      t.text :description
      t.string :website_url

      t.timestamps
    end
  end
end
