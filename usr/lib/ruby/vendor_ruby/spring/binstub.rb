command  = File.basename($0)
bin_path = '/usr/bin/spring'

if command == "spring"
  load bin_path
else
  disable = ENV["DISABLE_SPRING"]

  if Process.respond_to?(:fork) && (disable.nil? || disable.empty? || disable == "0")
    ARGV.unshift(command)
    load bin_path
  end
end
