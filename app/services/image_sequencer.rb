class ImageSequencer
  EXTENSIONS = %w[.jpg .jpeg .png .gif .webp].freeze
  STATE_FILE  = Rails.root.join("tmp", "image_sequence_index.json")
  MUTEX       = Mutex.new

  def self.pick(directory, mode)
    images = list_images(directory)
    return nil if images.empty?

    mode == "sequential" ? sequential_pick(images) : images.sample
  end

  def self.list_images(directory)
    return [] unless Dir.exist?(directory)

    Dir.entries(directory)
       .select { |f| EXTENSIONS.include?(File.extname(f).downcase) }
       .sort
       .map { |f| "/images/#{f}" }
  end

  def self.sequential_pick(images)
    MUTEX.synchronize do
      index = read_index
      image = images[index % images.size]
      write_index((index + 1) % images.size)
      image
    end
  end

  def self.read_index
    return 0 unless STATE_FILE.exist?

    JSON.parse(STATE_FILE.read).fetch("index", 0).to_i
  rescue JSON::ParserError
    0
  end

  def self.write_index(index)
    STATE_FILE.write({ index: index }.to_json)
  end
end
