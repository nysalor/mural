class Schedule < ApplicationRecord
  DAYS = %w[日 月 火 水 木 金 土].freeze
  ACTIONS = %w[dim stop].freeze

  validates :day_of_week, inclusion: { in: 0..6 }
  validates :start_time,  presence: true
  validates :end_time,    presence: true
  validates :action,      inclusion: { in: ACTIONS }
  validates :dim_level,   numericality: { in: 0..100 }

  def self.current_status
    now      = Time.current
    wday     = now.wday
    time_now = now.strftime("%H:%M")

    active = where(day_of_week: wday, enabled: true).find do |s|
      in_range?(s.start_time.strftime("%H:%M"), s.end_time.strftime("%H:%M"), time_now)
    end

    return { action: "normal" } unless active

    { action: active.action, dim_level: active.dim_level }
  end

  def self.in_range?(start_t, end_t, now)
    if start_t <= end_t
      now >= start_t && now < end_t
    else
      # 日をまたぐ場合 (例: 22:00 〜 07:00)
      now >= start_t || now < end_t
    end
  end
end
