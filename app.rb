require 'rubygems'
require 'bundler/setup'
require 'sinatra'

Bundler.require :default, Sinatra::Application.environment

# Mongoid.configure do |config|
#   environment = Sinatra::Application.environment.to_s
#   config.from_hash YAML.load_file(File.dirname(__FILE__) + '/mongoid.yml')[environment]
# end
