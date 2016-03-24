class CreateType < ActiveRecord::Migration
  def change
    create_table :types do |t|
        t.string :name
        t.integer :convention_id
        t.string :default_logo
        t.string :default_banner
    end
  end
end