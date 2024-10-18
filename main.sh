# TODO
# cleanup can't move forwards message
# look into using z

total_start=`date +%s.%N`
# TODO: what to do with this?
deno_working_dir="$HOME/Desktop/cd_time_machine"
debug_flag="$2"

red='\033[0;31m'
no_color='\033[0m'

if [[ "$debug_flag" == "--debug" ]]
then 
  # clean logs at the beginning of the script so can view the logs after running the script
  deno task --cwd="$deno_working_dir" cleanup
fi

# eg: get_runtime start end label
# $1: start
# $2: end
get_runtime() {
  echo "$3 runtime: $( echo "$2 - $1" | bc -l )"
}

case "$1" in 
  --forwards)
    before_nav_pwd=$(pwd)

    # run deno command directly to avoid the output from `deno task` i.e. Task push_stack ...
    if [[ "$2" == "--debug" ]]
    then 
      forwards_out=$(deno run --allow-write --allow-env --allow-read --allow-sys --allow-run --unstable-kv "$deno_working_dir/scripts/forwards.ts" --before_nav_pwd="$before_nav_pwd" --debug)
      echo "forwards_out: $forwards_out"; 
    else
      forwards_out=$(deno run --allow-write --allow-env --allow-read --allow-sys --allow-run --unstable-kv "$deno_working_dir/scripts/forwards.ts" --before_nav_pwd="$before_nav_pwd")
    fi
    if [[ "$forwards_out" == "__err" ]]
    then
      echo -e "${red}Can't move forwards!${no_color}"
      return
    else
      cd "$forwards_out"
    fi
    ;;
  --backwards)
    before_nav_pwd=$(pwd)
    if cd ".."
      after_nav_pwd=$(pwd)
      if [[ "$debug_flag" == "--debug" ]]
      then
        deno task --cwd="$deno_working_dir" backwards --after_nav_pwd="$after_nav_pwd" --before_nav_pwd="$before_nav_pwd" --debug
      else 
        (deno task --cwd="$deno_working_dir" backwards --after_nav_pwd="$after_nav_pwd" --before_nav_pwd="$before_nav_pwd" > /dev/null 2>&1 &)
      fi
    then
    fi
    ;;
  --clear)
    if [[ "$debug_flag" == "--debug" ]]
    then
      deno task --cwd="$deno_working_dir" clear_kv --debug
    else 
      (deno task --cwd="$deno_working_dir" clear_kv > /dev/null 2>&1 &)
    fi
    ;;
  *)
    before_nav_pwd=$(pwd)
    if cd "$1"
    then 
      after_nav_pwd=$(pwd)
      if [[ "$debug_flag" == "--debug" ]]
      then
        deno task --cwd="$deno_working_dir" push_stack --before_nav_pwd="$before_nav_pwd" --after_nav_pwd="$after_nav_pwd" --debug
      else 
        (deno task --cwd="$deno_working_dir" push_stack --before_nav_pwd="$before_nav_pwd" --after_nav_pwd="$after_nav_pwd" > /dev/null 2>&1 &)
      fi
    fi
    ;;
esac

total_end=`date +%s.%N`
# if [[ "$debug_flag" == "--debug" ]]
# then 
  get_runtime "$total_start" "$total_end" "Total"
# fi
