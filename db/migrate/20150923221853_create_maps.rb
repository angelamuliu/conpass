class CreateMaps < ActiveRecord::Migration
  def change
    create_table :maps do |t|
      t.integer :convention_id
      t.string :name
      t.datetime :start_date
      t.datetime :end_date

      t.timestamps
    end
  end
end
