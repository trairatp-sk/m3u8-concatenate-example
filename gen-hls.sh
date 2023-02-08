cd vid-01
ffmpeg -i vid-01.mp4 -codec: copy -start_number 0 -hls_time 10 -hls_list_size 0 -f hls vid-01.m3u8
cd ..
cd vid-02
ffmpeg -i vid-02.mp4 -codec: copy -start_number 0 -hls_time 10 -hls_list_size 0 -f hls vid-02.m3u8
cd ..
cd vid-03
ffmpeg -i vid-03.mp4 -codec: copy -start_number 0 -hls_time 10 -hls_list_size 0 -f hls vid-03.m3u8