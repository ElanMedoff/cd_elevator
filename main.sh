# TODO
# bootstrap script
# figure out deno_working_dir

total_start=`date +%s.%N`

# eg: get_runtime start end label
# $1: start
# $2: end
get_runtime() {
  echo "$3 runtime: $( echo "$2 - $1" | bc -l )"
}

# eg: err "bad argument!"
# $1: message
err() {
  red='\033[0;31m'
  no_color='\033[0m'
  echo -e "${red}Unknown option $1${no_color}"
}

script_dir="$(dirname "$0")"
change_dir=""
forwards_flag=0
backwards_flag=0
clear_flag=0
debug_flag=0

for arg in "$@"
do
  case "$arg" in 
    --forwards)
      forwards_flag=1
      shift
      ;;
    --backwards)
      backwards_flag=1
      shift
      ;;
    --clear)
      clear_flag=1
      shift
      ;;
    --debug)
      debug_flag=1
      shift
      ;;
    --change_dir=*)
      change_dir=$(echo "$arg" | cut -d'=' -f2)
      shift
      ;;
    --*)
      err "unknown option $arg"
      return
      ;;
    *)
      ;;
  esac
done

if [[ "$change_dir" == "" ]]
then 
  change_dir_flag=0
else 
  change_dir_flag=1
fi

sum=$((forwards_flag + backwards_flag + clear_flag + change_dir_flag))
if [[ "$sum" != 1 ]] 
then 
  err "only one of --forwards, --backwards, --clear, --change_dir is supported!"
  return
fi

if [[ "$debug_flag" == "--debug" ]]
then 
  # clean logs at the beginning of the script so can view the logs after running the script
  deno task --cwd="$script_dir" cleanup
fi

if [[ "$forwards_flag" == 1 ]]
then 

  before_nav_pwd=$(pwd)

  # run deno command directly to avoid the output from `deno task` i.e. Task push_stack ...
  if [[ "$debug_flag" == 1 ]]
  then 
    forwards_out=$(deno run --allow-write --allow-env --allow-read --allow-sys --allow-run --unstable-kv "$script_dir/scripts/forwards.ts" --before_nav_pwd="$before_nav_pwd" --debug)
    echo "forwards_out: $forwards_out"; 
  else
    forwards_out=$(deno run --allow-write --allow-env --allow-read --allow-sys --allow-run --unstable-kv "$script_dir/scripts/forwards.ts" --before_nav_pwd="$before_nav_pwd")
  fi
  if [[ "$forwards_out" == "__err" ]]
  then
    err "Can't move forwards!"
    return
  else
    cd "$forwards_out"
  fi

elif [[ "$backwards_flag" == 1 ]]
then

  before_nav_pwd=$(pwd)
  if cd ".."
    after_nav_pwd=$(pwd)
    if [[ "$debug_flag" == 1 ]]
    then
      deno task --cwd="$script_dir" backwards --after_nav_pwd="$after_nav_pwd" --before_nav_pwd="$before_nav_pwd" --debug
    else 
      (deno task --cwd="$script_dir" backwards --after_nav_pwd="$after_nav_pwd" --before_nav_pwd="$before_nav_pwd" > /dev/null 2>&1 &)
    fi
  then
  fi

elif [[ "$clear_flag" == 1 ]]
then

  if [[ "$debug_flag" == 1 ]]
  then
    deno task --cwd="$script_dir" clear_kv --debug
  else 
    (deno task --cwd="$script_dir" clear_kv > /dev/null 2>&1 &)
  fi

elif [[ "$change_dir_flag" == 1 ]]
then

  before_nav_pwd=$(pwd)
  if z "$change_dir"
  then 
    after_nav_pwd=$(pwd)
    if [[ "$debug_flag" == 1 ]]
    then
      deno task --cwd="$script_dir" push_stack --before_nav_pwd="$before_nav_pwd" --after_nav_pwd="$after_nav_pwd" --debug
    else 
      (deno task --cwd="$script_dir" push_stack --before_nav_pwd="$before_nav_pwd" --after_nav_pwd="$after_nav_pwd" > /dev/null 2>&1 &)
    fi
  fi

fi

total_end=`date +%s.%N`
if [[ "$debug_flag" == 1 ]]
then 
  get_runtime "$total_start" "$total_end" "Total"
fi
