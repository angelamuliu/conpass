# deploy.rb was written in march/april of 2014 
# if you dont understand how rails, capistrano, passenger, nginx, and digitalocean are working
# please google this "rails, capistrano, passenger, nginx, and digitalocean" 

# require bundler/cap provide 
# necessary access to libs that we need for deployment
require "bundler/capistrano"

# these next two lines apply to the server and database associated with the server
server "conpass.space", :app, :web, :db, :primary => true

# set the name of the application that you want to be deployed to the server
set :application, "conpass"

# set the user that will have permission to deploy
set :user, "deploy"

# no sudo allowed because sudo is evil
set :use_sudo, false

# master is always deployable ... aka dont merge crap into master  
set :branch, "master"

# set the forwarding agent and default run options to true to assist with github
ssh_options[:forward_agent] = true

# If you're getting those pesky, "stdin: is not a tty" errors throughout your deployment, try adding the above to the deploy script.
default_run_options[:pty] = true

# deploy from remote cache
set :deploy_via, :remote_cache

# where you want your application to be sitting on the vm
set :deploy_to, "/home/#{user}/apps/#{application}"

# using git for our source code mgmt on the vm
set :scm, :git
# git repo for code
set :repository, "git@github.com:angelamuliu/conpass.git"

# By default, Capistrano tries to "touch" normalized asset directories like "stylesheets" and "javascripts". 
# If you're not using the standard Ruby on Rails scaffolding (we use PHP almost exclusively) you will get warnings that these directories don't exist. 
# This variable will tell Capistrano to forgo touching those asset files.
set :normalize_asset_timestamps, false 

# turn on key forwarding
ssh_options[:forward_agent] = true

# keep only the last 5 releases
after 'deploy', 'deploy:cleanup'
after 'deploy:restart', 'deploy:cleanup'

namespace :deploy do
  task :start do ; end
  task :stop do ; end
  task :restart, :roles => :app, :except => { :no_release => true } do
    run "#{try_sudo} touch #{File.join(current_path,'tmp','restart.txt')}"
  end
  task :symlink_shared do
    run "ln -s /home/deploy/apps/conpass/shared/keys.yml /home/deploy/apps/conpass/releases/#{release_name}/config/"
  end
end

before "deploy:assets:precompile", "deploy:symlink_shared"
after "deploy:symlink_shared", "deploy:migrate"
