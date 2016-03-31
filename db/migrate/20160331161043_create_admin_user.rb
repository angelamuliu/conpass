class CreateAdminUser < ActiveRecord::Migration
    def up
        admin = User.new
        admin.username = KEYS[:admin]["username"]
        admin.password = KEYS[:admin]["password"]
        admin.password_confirmation = KEYS[:admin]["password"]
        admin.role = 0
        admin.save
    end

    def down
        admin = User.find_by_username(KEYS[:admin]["username"])
        admin.destroy
    end
end
